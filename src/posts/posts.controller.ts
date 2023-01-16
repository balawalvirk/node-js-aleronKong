import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { FirebaseService } from 'src/firebase/firebase.service';
import { makeQuery, ParseObjectId, Roles } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { NotificationService } from 'src/notification/notification.service';
import { MuteInterval, NotificationType, PostPrivacy, PostStatus, UserRoles } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment';
import { MutePostDto } from './dtos/mute-post.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostsService } from './posts.service';

@Controller('post')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly userService: UsersService,
    private readonly commentService: CommentService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationService: NotificationService
  ) {}

  @Roles(UserRoles.ADMIN)
  @Get('find-all')
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, skip: $q.skip };
    const posts = await this.postsService.paginate({}, options);
    const total = await this.postsService.countRecords({});
    const paginated = {
      total: total,
      pages: Math.floor(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }

  @Get(':id/find-one')
  async findOne(@Param('id', ParseObjectId) id: string) {
    return await this.postsService.findOne({ _id: id });
  }

  //find post of a specific user
  @Get('find-all/user/:id')
  async findUserPost(
    @Param('id', ParseObjectId) id: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    const $q = makeQuery({ page, limit });
    const condition = { creator: id };
    const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
    const total = await this.postsService.countRecords(condition);
    const posts = await this.postsService.find(condition, options);
    const paginated = {
      total,
      pages: Math.floor(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }

  @Get('home')
  async findHomePosts(@Query('page') page: string, @Query('limit') limit: string, @GetUser() user: UserDocument) {
    const $q = makeQuery({ page, limit });
    const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
    const total = await this.postsService.countRecords({});
    const followings = (await this.userService.findAllRecords({ friends: { $in: [user._id] } }).select('_id')).map(
      (user) => user._id
    );
    const condition = {
      creator: { $nin: user.blockedUsers },
      isBlocked: false,
      status: PostStatus.ACTIVE,
      $or: user.isGuildMember
        ? [{ privacy: PostPrivacy.PUBLIC }, { privacy: PostPrivacy.FOLLOWERS, creator: { $in: followings } }]
        : [
            { privacy: PostPrivacy.PUBLIC },
            { privacy: PostPrivacy.FOLLOWERS, creator: { $in: followings } },
            { privacy: PostPrivacy.GUILD_MEMBERS },
          ],
    };
    const posts = await this.postsService.find(condition, options);
    const paginated = {
      total,
      pages: Math.floor(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }

  @Post('like/:id')
  async addLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const postExists = await this.postsService.findOneRecord({ _id: id, likes: { $in: [user._id] } });
    // if (postExists) throw new HttpException('You already liked this post.', HttpStatus.BAD_REQUEST);
    const post = await this.postsService.update({ _id: id }, { $push: { likes: user._id } });
    await this.notificationService.createRecord({
      post: post._id,
      message: 'Your post liked',
      type: NotificationType.POST,
      sender: user._id,
      //@ts-ignore
      receiver: post.creator._id,
    });
    await this.firebaseService.sendNotification({
      token:
        'dFusJ6TrQducezzxOmS7JO:APA91bFwXW3OaSwqmh377ZIjnuFOTlhgb8BeoBhynTWGF6yBFtnzKhcJjKKDbtHlf3_LY6UXIZHj10nt_4k98cXWJNhZRETaLox2aY7jZxmb9c3D43RLgpuypgj178I9wO_9UMX1bUE2',
      notification: { title: 'Your post liked' },
      data: { postId: post._id.toString() },
    });
    return post;
  }

  @Put('un-like/:id')
  async unLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    return await this.postsService.update({ _id: id }, { $pull: { likes: user._id } });
  }

  @Post('comment/:id')
  async createComment(@Param('id') id: string, @GetUser() user: UserDocument, @Body() body: CreateCommentDto) {
    const comment = await this.commentService.createRecord({ content: body.content, creator: user._id, post: id });
    return await this.postsService.update({ _id: id }, { $push: { comments: comment._id } });
  }

  @Put('comment/update')
  async updateComment(@Body() { postId, commentId, content }: UpdateCommentDto) {
    await this.commentService.findOneRecordAndUpdate({ _id: commentId }, { content });
    return await this.postsService.findOne({ _id: postId });
  }

  @Delete(':postId/comment/:id/delete')
  async deleteComment(@Param('id', ParseObjectId) id: string) {
    const comment = await this.commentService.deleteSingleRecord({ _id: id });
    await this.postsService.findOneRecordAndUpdate({ _id: comment.post }, { $pull: { comments: comment._id } });
    return { message: 'Comment deleted successfully.' };
  }

  @Put(':id/update')
  async update(@Body() updatePostDto: UpdatePostDto, @Param('id', ParseObjectId) id: string) {
    return await this.postsService.update({ _id: id }, updatePostDto);
  }

  @Put('mute')
  async muteChat(@Body() mutePostDto: MutePostDto, @GetUser() user: UserDocument) {
    const now = new Date();
    let date = new Date(now);
    let updatedObj: any = { user: user._id, interval: mutePostDto.interval };
    if (mutePostDto.interval === MuteInterval.DAY) {
      //check if mute interval is one day then add 1 day in date
      date.setDate(now.getDate() + 1);
    } else if (mutePostDto.interval === MuteInterval.WEEK) {
      //check if mute interval is one day then add 7 day in date
      date.setDate(now.getDate() + 7);
    }
    date.toLocaleDateString();

    if (mutePostDto.interval === MuteInterval.DAY || MuteInterval.WEEK) {
      updatedObj = { ...updatedObj, date };
    } else {
      updatedObj = {
        ...updatedObj,
        startTime: mutePostDto.startTime,
        endTime: mutePostDto.endTime,
      };
    }

    await this.postsService.findOneRecordAndUpdate(
      { _id: mutePostDto.post },
      {
        $push: {
          mutes: { ...updatedObj },
        },
      }
    );
    return { message: 'Post muted successfully.' };
  }
}
