import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe, UsePipes, ParseBoolPipe } from '@nestjs/common';
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
import { FindAllPostQuery } from './dtos/find-all-post.query.dto';
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() { page, limit, query }: FindAllPostQuery) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const rjx = { $regex: query, $options: 'i' };
    const condition = { content: rjx };
    const posts = await this.postsService.findAllRecords(condition, options).populate('creator');
    const total = await this.postsService.countRecords(condition);
    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
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
  async findUserPost(@Param('id', ParseObjectId) id: string, @Query('page') page: string, @Query('limit') limit: string) {
    const $q = makeQuery({ page, limit });
    const condition = { creator: id };
    const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
    const total = await this.postsService.countRecords(condition);
    const posts = await this.postsService.find(condition, options);
    const paginated = {
      total,
      pages: Math.round(total / $q.limit),
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
    const followings = (await this.userService.findAllRecords({ friends: { $in: [user._id] } }).select('_id')).map((user) => user._id);
    const condition = {
      creator: { $nin: [user.blockedUsers] },
      isBlocked: false,
      status: PostStatus.ACTIVE,
      $or: user.isGuildMember
        ? [
            { creator: user._id },
            { privacy: PostPrivacy.PUBLIC },
            { privacy: PostPrivacy.FOLLOWERS, creator: { $in: followings } },
            { privacy: PostPrivacy.GUILD_MEMBERS },
          ]
        : [
            { creator: user._id },
            { privacy: PostPrivacy.PUBLIC },
            { privacy: PostPrivacy.FOLLOWERS, creator: { $in: followings } },
            { $and: [{ privacy: PostPrivacy.GUILD_MEMBERS, creator: user._id }] },
          ],
    };
    const posts = await this.postsService.find(condition, options);
    const total = await this.postsService.countRecords(condition);
    const paginated = {
      total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }

  @Post('like/:id')
  async addLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const postExists = await this.postsService.findOneRecord({ _id: id, likes: { $in: [user._id] } });
    if (postExists) return await this.postsService.update({ _id: id }, { $pull: { likes: user._id } });
    const post = await this.postsService.update({ _id: id }, { $push: { likes: user._id } });

    //@ts-ignore
    if (user._id != post.creator._id.toString()) {
      await this.notificationService.createRecord({
        post: post._id,
        message: 'liked your post.',
        type: NotificationType.POST_LIKED,
        sender: user._id,
        //@ts-ignore
        receiver: post.creator._id,
      });
      if (post.creator.fcmToken) {
        await this.firebaseService.sendNotification({
          token: post.creator.fcmToken,
          notification: { title: 'liked your post.' },
          data: { post: post._id.toString(), type: NotificationType.POST_LIKED },
        });
      }
    }

    return post;
  }

  @Put('un-like/:id')
  async unLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    return await this.postsService.update({ _id: id }, { $pull: { likes: user._id } });
  }

  @Post('comment/:id')
  async createComment(@Param('id') id: string, @GetUser() user: UserDocument, @Body() body: CreateCommentDto) {
    const comment = await this.commentService.createRecord({ content: body.content, creator: user._id, post: id });
    const post = await this.postsService.update({ _id: id }, { $push: { comments: comment._id } });

    //@ts-ignore
    if (user._id != post.creator._id.toString()) {
      await this.notificationService.createRecord({
        post: post._id,
        message: 'commented on your post.',
        type: NotificationType.POST_COMMENTED,
        sender: user._id,
        //@ts-ignore
        receiver: post.creator._id,
      });
      // check if user has fcm token then send notification to that user.
      if (post.creator.fcmToken) {
        await this.firebaseService.sendNotification({
          token: post.creator.fcmToken,
          notification: { title: 'commented on your post.' },
          data: { post: post._id.toString(), type: NotificationType.POST_COMMENTED },
        });
      }
    }

    return post;
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
    const date = new Date(now);
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

  @Roles(UserRoles.ADMIN)
  @Put(':id/block-unblock')
  async block(@Param('id', ParseObjectId) id: string, @Query('block', ParseBoolPipe) block: boolean) {
    await this.postsService.findOneRecordAndUpdate({ _id: id }, { isBlocked: block === true ? true : false });
    return { message: `Post ${block === true ? 'blocked' : 'unblock'} successfully.` };
  }

  @Roles(UserRoles.ADMIN)
  @Put(':id/feature-unfeature')
  async featurePost(@Param('id', ParseObjectId) id: string, @Query('isFeatured', ParseBoolPipe) isFeatured: boolean) {
    await this.postsService.findOneRecordAndUpdate({ _id: id }, { isFeatured: isFeatured === true ? true : false });
    return { message: `Post ${isFeatured ? 'featured' : 'un featured'} successfully.` };
  }
}
