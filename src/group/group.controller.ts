import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostsService } from 'src/posts/posts.service';
import { CreatePostsDto } from 'src/posts/dtos/create-posts';
import { GroupPrivacy, MuteInterval, NotificationType, PostType } from 'src/types';
import { makeQuery, ParseObjectId } from 'src/helpers';
import { FundService } from 'src/fundraising/fund.service';
import { FundraisingService } from 'src/fundraising/fundraising.service';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { MuteGroupDto } from './dto/mute-group.dto';
import { FindPostsOfGroupQueryDto } from './dto/findGroupPost.query.dto';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { ModeratorService } from './moderator.service';
import { UpdateModeratorDto } from './dto/update-moderator.dto';

@Controller('group')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly postService: PostsService,
    private readonly fundraisingService: FundraisingService,
    private readonly fundService: FundService,
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService,
    private readonly moderatorService: ModeratorService
  ) {}

  @Post('create')
  async create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: UserDocument) {
    return await this.groupService.createRecord({ ...createGroupDto, creator: user._id });
  }

  @Post('post/create')
  async createPost(@Body() createPostDto: CreatePostsDto, @GetUser() user: UserDocument) {
    const post = await this.postService.createPost({ ...createPostDto, creator: user._id });
    if (post.group) {
      const group = await this.groupService
        .findOneRecordAndUpdate({ _id: post.group }, { $push: { posts: post._id } })
        .populate({ path: 'creator', select: 'fcmToken' });

      // check if user is posting in your own group then stop sending notification
      //@ts-ignore
      if (user._id != group.creator._id.toString()) {
        await this.notificationService.createRecord({
          type: NotificationType.NEW_GROUP_POST,
          group: group._id,
          message: `has posted in your ${group.name} group`,
          sender: user._id,
          //@ts-ignore
          receiver: group.creator._id,
        });

        //@ts-ignore
        if (!this.groupService.isGroupMuted(group.mutes, group.creator._id)) {
          if (group.creator.fcmToken) {
            await this.firebaseService.sendNotification({
              token: group.creator.fcmToken,
              notification: { title: `has posted in your ${group.name} group` },
              data: { group: group._id.toString(), type: NotificationType.NEW_GROUP_POST },
            });
          }
        }
      }
    }

    // check if user tagged to any friend
    if (post.tagged) {
      for (const taggedUser of post.tagged) {
        await this.notificationService.createRecord({
          type: NotificationType.USER_TAGGED,
          post: post._id,
          message: `has tagged you in post.`,
          sender: user._id,
          //@ts-ignore
          receiver: taggedUser._id,
        });

        // check if user has enabled notifications
        if (taggedUser.enableNotifications) {
          // check if user has firebase token
          if (taggedUser.fcmToken) {
            await this.firebaseService.sendNotification({
              token: taggedUser.fcmToken,
              notification: { title: `has tagged you in post.` },
              data: { post: post._id.toString(), type: NotificationType.USER_TAGGED },
            });
          }
        }
      }
    }

    return post;
  }

  @Delete('post/:id/delete')
  async deletePost(@Param('id', ParseObjectId) id: string) {
    const post = await this.postService.deleteSingleRecord({ _id: id });
    // check if post is in group then remove post from group also
    if (post.group) await this.groupService.findOneRecordAndUpdate({ _id: post.group }, { $pull: { posts: post._id } });
    // check if post is fundraising then also remove fundraising project
    if (post.type === PostType.FUNDRAISING) {
      await this.fundraisingService.deleteSingleRecord({ _id: post.fundraising });
      await this.fundService.deleteManyRecord({ project: post.fundraising });
    }
    return { message: 'Post deleted successfully.' };
  }

  //api to find all post of groups that user joined
  @Get('feed')
  async feed(@GetUser() user: UserDocument, @Query('page') page: string, @Query('limit') limit: string) {
    const $q = makeQuery({ page, limit });
    const options = { sort: { pin: -1, ...$q.sort }, limit: $q.limit, skip: $q.skip };
    const condition = {
      'members.member': user._id,
    };
    const total = await this.groupService.countRecords(condition);
    const groups = await this.groupService.feed(condition, options);
    let posts = [];
    groups.forEach((group) => {
      if (group.posts.length !== 0) {
        posts = [...posts, ...group.posts];
      }
    });
    const paginated = {
      total,
      pages: Math.floor(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }

  @Get('find-one/:id')
  async findOne(@Param('id') id: string) {
    return await this.groupService.findOneRecord({ _id: id });
  }

  @Put('update/:id')
  async update(@Param('id', ParseObjectId) id: string, @Body() updateGroupDto: UpdateGroupDto) {
    const group = await this.groupService.findOneRecord({ _id: id });
    if (!group) throw new HttpException('Group not found.', HttpStatus.BAD_REQUEST);
    return await this.groupService.findOneRecordAndUpdate({ _id: id }, updateGroupDto);
  }

  @Put('join/:id')
  async joinGroup(@GetUser() user: UserDocument, @Param('id') id: string) {
    const group = await this.groupService.findOneRecord({ _id: id }).populate({ path: 'creator', select: 'fcmToken' });
    if (!group) throw new HttpException('Group does not exists.', HttpStatus.BAD_REQUEST);

    //check if user is already a member of this group
    const memberFound = group.members.filter((member) => member.member === user._id);
    if (memberFound.length > 0) throw new HttpException('You are already a member of this group.', HttpStatus.BAD_REQUEST);
    //check if group is private
    if (group.privacy === GroupPrivacy.PRIVATE) {
      //check if user request is already in request array  of this group
      const requestFound = group.requests.filter((request) => request === user._id);
      if (requestFound.length > 0) throw new HttpException('Your request to join group is pending.', HttpStatus.BAD_REQUEST);
      await this.notificationService.createRecord({
        type: NotificationType.GROUP_JOIN_REQUEST,
        group: group._id,
        message: `has send a join request for ${group.name} group`,
        sender: user._id,
        //@ts-ignore
        receiver: group.creator._id,
      });
      // check if user does not mute the group and have fcm Token then send a fcm  message.
      //@ts-ignore
      if (!this.groupService.isGroupMuted(group.mutes, group.creator._id) && group.creator.fcmToken) {
        await this.firebaseService.sendNotification({
          token: group.creator.fcmToken,
          notification: { title: `has send a join request for ${group.name} group` },
          data: { group: group._id.toString() },
        });
      }
      return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { requests: user._id } });
    }
    await this.notificationService.createRecord({
      type: NotificationType.GROUP_JOINED,
      group: group._id,
      message: `has joined your ${group.name} group`,
      sender: user._id,
      //@ts-ignore
      receiver: group.creator._id,
    });

    const updatedGroup = await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { members: { member: user._id } } });

    // check if user does not mute the group and have fcm Token then send a fcm  message.
    //@ts-ignore
    if (!this.groupService.isGroupMuted(group.mutes, group.creator._id) && group.creator.fcmToken) {
      await this.firebaseService.sendNotification({
        token: group.creator.fcmToken,
        notification: { title: `has joined your ${group.name} group` },
        data: { group: group._id.toString() },
      });
    }
    return updatedGroup;
  }

  @Put('leave/:id')
  async leaveGroup(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { members: { member: user._id } } });
    return 'Group left successfully.';
  }

  @Delete('delete/:id')
  async remove(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const group = await this.groupService.findOneRecord({ _id: id });
    if (!group) throw new HttpException('Group does not exist', HttpStatus.BAD_REQUEST);
    if (group.creator.toString() != user._id) throw new HttpException('You cannot delete this group', HttpStatus.UNAUTHORIZED);
    await this.groupService.deleteSingleRecord({ _id: group._id });
    await this.postService.deleteManyRecord({ group: group._id });
    return 'Group deleted successfully.';
  }

  @Get('all-members/:id')
  async findAllMembers(@Param('id') id: string) {
    const group = await this.groupService.findAllMembers({ _id: id });
    return group.members;
  }

  @Get('all-requests/:id')
  async findAllRequests(@Param('id', ParseObjectId) id: string) {
    const group = await this.groupService.findAllRequests({ _id: id });
    if (!group.requests) return [];
    return group.requests;
  }

  @Put('request/:id/:userId')
  async approveRejectRequest(
    @Query('isApproved', new ParseBoolPipe()) isApproved: boolean,
    @Param('id', ParseObjectId) id: string,
    @Param('userId', ParseObjectId) userId: string
  ) {
    if (isApproved) {
      await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });
      return 'Request approved successfully.';
    } else {
      await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
      return 'Request rejected successfully.';
    }
  }

  @Get('find-all')
  async findAllGroups(@Query('type') type: string, @Query('query', new DefaultValuePipe('')) query: string, @GetUser() user: UserDocument) {
    let groups;
    if (type === 'forYou') {
      groups = await this.groupService.findAllRecords({ name: { $regex: query, $options: 'i' }, 'members.member': user._id }, { createdAt: -1 });
    } else if (type === 'yourGroups') {
      groups = await this.groupService.findAllRecords(
        {
          $and: [{ name: { $regex: query, $options: 'i' } }, { creator: user._id }],
        },
        { createdAt: -1 }
      );
    } else if (type === 'discover') {
      groups = await this.groupService.findAllRecords(
        {
          $and: [{ name: { $regex: query, $options: 'i' } }, { 'members.member': { $ne: user._id }, creator: { $ne: user._id } }],
        },
        { createdAt: -1 }
      );
    } else {
      groups = await this.groupService.findAllRecords();
    }
    return groups;
  }

  @Put('report/:id')
  async report(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument, @Body('reason') reason: string) {
    await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { reports: { reporter: user._id, reason } } });
    return 'Report submitted successfully.';
  }

  @Put('mute')
  async muteGroup(@Body() muteGroupDto: MuteGroupDto, @GetUser() user: UserDocument) {
    const now = new Date();
    const date = new Date(now);
    let updatedObj: any = { user: user._id, interval: muteGroupDto.interval };
    if (muteGroupDto.interval === MuteInterval.DAY) {
      //check if mute interval is one day then add 1 day in date
      date.setDate(now.getDate() + 1);
    } else if (muteGroupDto.interval === MuteInterval.WEEK) {
      //check if mute interval is one day then add 7 day in date
      date.setDate(now.getDate() + 7);
    }
    date.toLocaleDateString();

    if (muteGroupDto.interval === MuteInterval.DAY || MuteInterval.WEEK) updatedObj = { ...updatedObj, date };
    else {
      updatedObj = { ...updatedObj, startTime: muteGroupDto.startTime, endTime: muteGroupDto.endTime };
    }
    await this.groupService.findOneRecordAndUpdate({ _id: muteGroupDto.group }, { $push: { mutes: { ...updatedObj } } });
    return { message: 'Group muted successfully.' };
  }

  @Get(':id/post/find-all')
  async findPostsOfGroups(@Param('id', ParseObjectId) id: string, @Query() { limit, page }: FindPostsOfGroupQueryDto) {
    const $q = makeQuery({ page, limit });
    const options = { sort: { pin: -1, ...$q.sort }, limit: $q.limit, skip: $q.skip };
    const condition = { group: id };
    const posts = await this.postService.find(condition, options);
    const total = await this.postService.countRecords(condition);
    const paginated = {
      total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }

  // ======================================================= moderator apis ========================================================================

  @Post('moderator/create')
  async createModerator(@Body() createModeratorDto: CreateModeratorDto) {
    const moderator = await this.moderatorService.createRecord(createModeratorDto);
    await this.groupService.findOneRecordAndUpdate({ _id: createModeratorDto.group }, { $push: { moderators: moderator._id } });
    return moderator;
  }

  @Get(':id/moderator/find-all')
  async findAllModerator(@Param('id', ParseObjectId) id: string) {
    return await this.moderatorService.find({ group: id });
  }

  @Delete('moderator/:id/delete')
  async deleteModerator(@Param('id', ParseObjectId) id: string) {
    const moderator = await this.moderatorService.deleteSingleRecord({ _id: id });
    await this.groupService.findOneRecordAndUpdate({ _id: moderator.group }, { $pull: { moderators: moderator._id } });
    return moderator;
  }

  @Put('moderator/:id/update')
  async updateModerator(@Param('id', ParseObjectId) id: string, @Body() updateModeratorDto: UpdateModeratorDto) {
    return await this.moderatorService.findOneRecordAndUpdate({ _id: id }, updateModeratorDto);
  }
}
