import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
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
import { GroupPrivacy } from 'src/types';
import { ParseObjectId } from 'src/helpers';

@Controller('group')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly postService: PostsService
  ) {}

  @Post('create')
  async create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: UserDocument) {
    return await this.groupService.createRecord({ ...createGroupDto, creator: user._id });
  }

  @Post('create-post/:id')
  async createPost(
    @Body() createPostDto: CreatePostsDto,
    @GetUser() user: UserDocument,
    @Param('id') id: string
  ) {
    const post = await this.postService.createRecord({
      ...createPostDto,
      creator: user._id,
      group: id,
    });
    await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { posts: post._id } });
    return post;
  }

  @Get('find-one/:id')
  async findOne(@Param('id') id: string) {
    return await this.groupService.findOne({ _id: id });
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return await this.groupService.findOneRecordAndUpdate({ _id: id }, updateGroupDto);
  }

  @Patch('join/:id')
  async joinGroup(@GetUser() user: UserDocument, @Param('id') id: string) {
    const group: GroupDocument = await this.groupService.findOneRecord({ _id: id });
    if (group) {
      //check if user is already a member of this group
      const memberFound = group.members.filter((member) => member.member === user._id);
      if (memberFound.length > 0)
        throw new BadRequestException('You are already a member of this group.');
      //check if group is private
      if (group.privacy === GroupPrivacy.PRIVATE) {
        //check if user request is already in request array  of this group
        const requestFound = group.requests.filter((request) => request === user._id);
        if (requestFound.length > 0)
          throw new BadRequestException('Your request to join group is pending.');
        return await this.groupService.findOneRecordAndUpdate(
          { _id: id },
          { $push: { requests: user._id } }
        );
      }
      return await this.groupService.findOneRecordAndUpdate(
        { _id: id },
        { $push: { members: { member: user._id } } }
      );
    } else throw new BadRequestException('Group does not exists.');
  }

  @Patch('leave/:id')
  async leaveGroup(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    await this.groupService.findOneRecordAndUpdate(
      { _id: id },
      { $pull: { members: { member: user._id } } }
    );
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

  @Patch('request/:id/:userId')
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
    let groups: GroupDocument[];
    if (type === 'forYou') {
      groups = await this.groupService.findAllRecords({
        name: { $regex: query, $options: 'i' },
        'members.member': user._id,
      });
    } else if (type === 'yourGroups') {
      groups = await this.groupService.findAllRecords({
        $or: [{ name: { $regex: query, $options: 'i' } }, { creator: user._id }],
      });
    } else if (type === 'discover') {
      groups = await this.groupService.findAllRecords({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { 'members.member': { $ne: user._id }, creator: { $ne: user._id } },
        ],
      });
    } else {
      groups = await this.groupService.findAllRecords();
    }

    return groups;
  }

  @Patch('report/:id')
  async report(
    @Param('id', ParseObjectId) id: string,
    @GetUser() user: UserDocument,
    @Body('reason') reason: string
  ) {
    await this.groupService.findOneRecordAndUpdate(
      { _id: id },
      { $push: { reports: { reporter: user._id, reason } } }
    );
    return 'Report submitted successfully.';
  }
}
