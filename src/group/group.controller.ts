import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseBoolPipe,
  Put,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
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
import { MuteService } from 'src/mute/mute.service';
import { FindAllQueryDto } from './dto/find-all.query.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { BanMemberDto } from './dto/ban-member.dto';

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
    private readonly moderatorService: ModeratorService,
    private readonly muteService: MuteService
  ) {}

  @Post('create')
  async create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: UserDocument) {
    return await this.groupService.createRecord({ ...createGroupDto, creator: user._id });
  }

  @Post('post/create')
  async createPost(@Body() createPostDto: CreatePostsDto, @GetUser() user: UserDocument) {
    if (createPostDto.group) {
      const group = await this.groupService.findOneRecord({ _id: createPostDto.group });
      if (!group) throw new HttpException('Group does not exists.', HttpStatus.BAD_REQUEST);

      // check if current user is member of group.
      const member = group.members.find((member) => member.member.toString() == user._id);

      // check if member is banned or not
      if (member?.banned) throw new HttpException('You are not allowed to create post.', HttpStatus.FORBIDDEN);

      const post = await this.postService.createPost({ ...createPostDto, creator: user._id });

      await this.groupService
        .findOneRecordAndUpdate({ _id: post.group }, { $push: { posts: post._id } })
        .populate({ path: 'creator', select: 'fcmToken' });

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
        const mute = await this.muteService.findOneRecord({ group: group._id, user: group.creator._id });

        if (!this.groupService.isGroupMuted(mute)) {
          if (group.creator.fcmToken) {
            await this.firebaseService.sendNotification({
              token: group.creator.fcmToken,
              notification: { title: `has posted in your ${group.name} group` },
              data: { group: group._id.toString(), type: NotificationType.NEW_GROUP_POST },
            });
          }
        }
      }

      return post;
    } else {
      const post = await this.postService.createPost({ ...createPostDto, creator: user._id });

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
  }

  async isGroupModerator(postId: string, userId: string) {
    const post = await this.postService.findOneRecord({ _id: postId });
    // check if post is not group post then throw exception
    if (!post.group) return false;
    const moderator = await this.moderatorService.findOneRecord({ group: post.group, user: userId });
    //check if user is moderator
    if (!moderator) return false;
    else return moderator;
  }

  @Delete('post/:id/delete')
  async deletePost(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const post = await this.postService.findOneRecord({ _id: id });

    if (!post) throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);
    if (post.creator.toString() == user._id) {
      const deletedPost = await this.postService.deleteSingleRecord({ _id: id });
      if (deletedPost.group) await this.groupService.findOneRecordAndUpdate({ _id: deletedPost.group }, { $pull: { posts: deletedPost._id } });
      if (deletedPost.type === PostType.FUNDRAISING) {
        await this.fundraisingService.deleteSingleRecord({ _id: deletedPost.fundraising });
        await this.fundService.deleteManyRecord({ project: deletedPost.fundraising });
      }
    } else {
      const moderator = await this.isGroupModerator(post._id, user._id);
      if (!moderator || !moderator.deletePosts) throw new UnauthorizedException();
      const deletedPost = await this.postService.deleteSingleRecord({ _id: id });
      if (deletedPost.group) await this.groupService.findOneRecordAndUpdate({ _id: deletedPost.group }, { $pull: { posts: deletedPost._id } });
      if (deletedPost.type === PostType.FUNDRAISING) {
        await this.fundraisingService.deleteSingleRecord({ _id: deletedPost.fundraising });
        await this.fundService.deleteManyRecord({ project: deletedPost.fundraising });
      }
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
    return await this.groupService.findOneRecord({ _id: id }).populate([{ path: 'mutes' }, { path: 'moderators' }]);
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
      //@ts-ignore
      if (group.creator.fcmToken) {
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

    //@ts-ignore
    if (group.creator.fcmToken) {
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

  @Put('remove-member')
  async removeMember(@Body() removeMemberDto: RemoveMemberDto, @GetUser() user: UserDocument) {
    const group = await this.groupService.findOneRecord({ _id: removeMemberDto.group }).populate({ path: 'moderators', match: { user: user._id } });
    if (!group) throw new HttpException('Group does not exist.', HttpStatus.BAD_REQUEST);
    if (group.creator.toString() != user._id) {
      if (!group.moderators || group.moderators.length === 0 || !group.moderators[0].removeMembers)
        throw new HttpException('You cannot remove a member.', HttpStatus.FORBIDDEN);
    }
    const updatedGroup = await this.groupService.findOneRecordAndUpdate(
      { _id: removeMemberDto.group },
      { $pull: { members: { member: removeMemberDto.member } } }
    );
    return updatedGroup.members;
  }

  @Put('ban-member')
  async banMember(@Body() banMemberDto: BanMemberDto, @GetUser() user: UserDocument) {
    const group = await this.groupService.findOneRecord({ _id: banMemberDto.group }).populate({ path: 'moderators', match: { user: user._id } });
    if (!group) throw new HttpException('Group does not exist.', HttpStatus.BAD_REQUEST);

    // check if user is creator of this group or moderator
    if (group.creator.toString() != user._id) {
      if (!group.moderators || group.moderators.length === 0 || !group.moderators[0].banMembers)
        throw new HttpException('You cannot ban a member.', HttpStatus.FORBIDDEN);
    }
    const updatedGroup = await this.groupService.findOneRecordAndUpdate(
      { _id: banMemberDto.group, 'members.member': banMemberDto.member },
      { $set: { 'members.$.banned': true } }
    );
    return updatedGroup.members;
  }

  @Put('un-ban-member')
  async unBanMember(@Body() unBanMemberDto: BanMemberDto, @GetUser() user: UserDocument) {
    const group = await this.groupService.findOneRecord({ _id: unBanMemberDto.group }).populate({ path: 'moderators', match: { user: user._id } });
    if (!group) throw new HttpException('Group does not exist.', HttpStatus.BAD_REQUEST);
    if (group.creator.toString() != user._id) {
      if (!group.moderators || group.moderators.length === 0 || !group.moderators[0].banMembers)
        throw new HttpException('You are not allowed to un ban a member.', HttpStatus.FORBIDDEN);
    }

    const updatedGroup = await this.groupService.findOneRecordAndUpdate(
      { _id: unBanMemberDto.group, 'members.member': unBanMemberDto.member },
      { $set: { 'members.$.banned': false } }
    );
    return updatedGroup.members;
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
    @Param('userId', ParseObjectId) userId: string,
    @GetUser() user: UserDocument
  ) {
    const group = await this.groupService.findOneRecord({ _id: id });
    if (!group) throw new HttpException('Group does not exist.', HttpStatus.BAD_REQUEST);

    if (group.creator.toString() == user._id) {
      if (isApproved) {
        await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });
        return 'Request approved successfully.';
      } else {
        await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
        return 'Request rejected successfully.';
      }
    } else {
      const moderator = await this.moderatorService.findOneRecord({ group: id, user: user._id });
      if (!moderator || !moderator.acceptMemberRequests) throw new UnauthorizedException();

      if (isApproved) {
        await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });
        return 'Request approved successfully.';
      } else {
        await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
        return 'Request rejected successfully.';
      }
    }
  }

  @Get('find-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllGroups(@Query() { type, query, showModeratorGroups }: FindAllQueryDto, @GetUser() user: UserDocument) {
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
    }
    // if moderator group is true then show all groups where user added as moderator
    else if (showModeratorGroups) {
      const groupIds = (await this.moderatorService.findAllRecords({ user: user._id })).map((moderator) => moderator.group);
      groups = await this.groupService.findAllRecords({ _id: { $in: groupIds } });
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
    let updatedObj: any = { user: user._id, interval: muteGroupDto.interval, group: muteGroupDto.group };
    if (muteGroupDto.interval === MuteInterval.DAY) {
      date.setDate(now.getDate() + 1);
    } else if (muteGroupDto.interval === MuteInterval.WEEK) {
      //check if mute interval is one day then add 7 day in date
      date.setDate(now.getDate() + 7);
    }
    date.toLocaleDateString();

    const muteFound = await this.muteService.findOneRecord({ user: user._id, group: muteGroupDto.group });

    //check if mute object already exists then update its interval only
    if (muteFound) {
      const { user, group, ...rest } = updatedObj;
      await this.muteService.findOneRecordAndUpdate({ _id: muteFound._id }, rest);
    } else {
      const mute = await this.muteService.createRecord(updatedObj);
      await this.groupService.findOneRecordAndUpdate({ _id: muteGroupDto.group }, { $push: { mutes: mute._id } });
    }
    return { message: 'Group muted successfully.' };
  }

  @Put(':id/un-mute')
  async unMute(@Param('id', ParseObjectId) id: string) {
    const mute = await this.muteService.deleteSingleRecord({ _id: id });
    if (!mute) throw new HttpException('Mute does not exists.', HttpStatus.BAD_REQUEST);
    await this.groupService.findOneRecordAndUpdate({ _id: mute.chat }, { $pull: { mutes: mute._id } });
    return mute;
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
  async createModerator(@Body() createModeratorDto: CreateModeratorDto, @GetUser() user: UserDocument) {
    const group = await this.groupService.findOneRecord({ _id: createModeratorDto.group });
    if (!group) throw new HttpException('Group does not exists.', HttpStatus.BAD_REQUEST);
    if (group.creator.toString() != user._id) throw new UnauthorizedException();
    const moderator = await this.moderatorService.createRecord(createModeratorDto);
    await this.groupService.findOneRecordAndUpdate({ _id: createModeratorDto.group }, { $push: { moderators: moderator._id } });
    return moderator;
  }

  // find all moderators of specfic group
  @Get(':id/moderator/find-all')
  async findAllModerator(@Param('id', ParseObjectId) id: string) {
    return await this.moderatorService.find({ group: id });
  }

  @Delete('moderator/:id/delete')
  async deleteModerator(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const moderator = await this.moderatorService.findOneRecord({ _id: id }).populate('group');
    if (!moderator) throw new HttpException('Moderator does not exists.', HttpStatus.BAD_REQUEST);
    if (moderator.user.toString() != user._id || moderator.group.creator.toString() != user._id) throw new UnauthorizedException();
    await this.moderatorService.deleteSingleRecord({ _id: id });
    await this.groupService.findOneRecordAndUpdate({ _id: moderator.group }, { $pull: { moderators: moderator._id } });
    return moderator;
  }

  @Put('moderator/:id/update')
  async updateModerator(@Param('id', ParseObjectId) id: string, @Body() updateModeratorDto: UpdateModeratorDto, @GetUser() user: UserDocument) {
    const moderator = await this.moderatorService.findOneRecord({ _id: id }).populate('group');
    if (!moderator) throw new HttpException('Moderator does not exists.', HttpStatus.BAD_REQUEST);
    if (moderator.user.toString() != user._id || moderator.group.creator.toString() != user._id) throw new UnauthorizedException();
    return await this.moderatorService.findOneRecordAndUpdate({ _id: id }, updateModeratorDto);
  }
}
