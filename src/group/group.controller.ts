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
import { GroupDocument } from './group.schema';
import { GroupPrivacy, PostType } from 'src/types';
import { ParseObjectId } from 'src/helpers';
import { PostDocument } from 'src/posts/posts.schema';
import { FundService } from 'src/fundraising/fund.service';
import { FundraisingService } from 'src/fundraising/fundraising.service';

@Controller('group')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly postService: PostsService,
    private readonly fundraisingService: FundraisingService,
    private readonly fundService: FundService
  ) {}

  @Post('create')
  async create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: UserDocument) {
    return await this.groupService.createRecord({ ...createGroupDto, creator: user._id });
  }

  @Post('post/create')
  async createPost(@Body() createPostDto: CreatePostsDto, @GetUser() user: UserDocument) {
    const post: PostDocument = await this.postService.createPost({
      ...createPostDto,
      creator: user._id,
    });
    if (post.group) {
      await this.groupService.findOneRecordAndUpdate({ _id: post.group }, { $push: { posts: post._id } });
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
  async feed(@GetUser() user: UserDocument) {
    const groups = await this.groupService.feed({
      'members.member': user._id,
    });
    let posts = [];
    groups.forEach((group) => {
      if (group.posts.length !== 0) {
        posts = [...posts, ...group.posts];
      }
    });
    return posts;
  }

  @Get('find-one/:id')
  async findOne(@Param('id') id: string) {
    return await this.groupService.findOne({ _id: id });
  }

  @Put('update/:id')
  async update(@Param('id', ParseObjectId) id: string, @Body() updateGroupDto: UpdateGroupDto) {
    const group = await this.groupService.findOneRecord({ _id: id });
    if (!group) throw new HttpException('Group not found.', HttpStatus.BAD_REQUEST);
    return await this.groupService.findOneRecordAndUpdate({ _id: id }, updateGroupDto);
  }

  @Put('join/:id')
  async joinGroup(@GetUser() user: UserDocument, @Param('id') id: string) {
    const group = await this.groupService.findOneRecord({ _id: id });
    if (group) {
      //check if user is already a member of this group
      const memberFound = group.members.filter((member) => member.member === user._id);
      if (memberFound.length > 0)
        throw new HttpException('You are already a member of this group.', HttpStatus.BAD_REQUEST);
      //check if group is private
      if (group.privacy === GroupPrivacy.PRIVATE) {
        //check if user request is already in request array  of this group
        const requestFound = group.requests.filter((request) => request === user._id);
        if (requestFound.length > 0)
          throw new HttpException('Your request to join group is pending.', HttpStatus.BAD_REQUEST);
        return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { requests: user._id } });
      }
      return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { members: { member: user._id } } });
    } else throw new HttpException('Group does not exists.', HttpStatus.BAD_REQUEST);
  }

  @Put('leave/:id')
  async leaveGroup(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { members: { member: user._id } } });
    return 'Group left successfully.';
  }

  @Delete('delete/:id')
  async remove(@Param('id', ParseObjectId) id: string) {
    const group: GroupDocument = await this.groupService.deleteSingleRecord({ _id: id });
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
    const group: GroupDocument = await this.groupService.findAllRequests({ _id: id });
    return group.requests;
  }

  @Put('request/:id/:userId')
  async approveRejectRequest(
    @Query('isApproved', new ParseBoolPipe()) isApproved: boolean,
    @Param('id', ParseObjectId) id: string,
    @Param('userId', ParseObjectId) userId: string
  ) {
    if (isApproved) {
      await this.groupService.findOneRecordAndUpdate(
        { _id: id },
        { $pull: { requests: userId }, $push: { members: { member: userId } } }
      );
      return 'Request approved successfully.';
    } else {
      await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
      return 'Request rejected successfully.';
    }
  }

  @Get('find-all')
  async findAllGroups(
    @Query('type') type: string,
    @Query('query', new DefaultValuePipe('')) query: string,
    @GetUser() user: UserDocument
  ) {
    let groups;
    if (type === 'forYou') {
      groups = await this.groupService.findAllRecords({
        name: { $regex: query, $options: 'i' },
        'members.member': user._id,
      });
    } else if (type === 'yourGroups') {
      groups = await this.groupService.findAllRecords({
        $and: [{ name: { $regex: query, $options: 'i' } }, { creator: user._id }],
      });
    } else if (type === 'discover') {
      groups = await this.groupService.findAllRecords({
        $and: [
          { name: { $regex: query, $options: 'i' } },
          { 'members.member': { $ne: user._id }, creator: { $ne: user._id } },
        ],
      });
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
}
