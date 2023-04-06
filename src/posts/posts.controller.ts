import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
  ParseBoolPipe,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { FirebaseService } from 'src/firebase/firebase.service';
import { GroupService } from 'src/group/group.service';
import { ModeratorService } from 'src/group/moderator.service';
import { makeQuery, ParseObjectId, Roles } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType, PostPrivacy, PostStatus, PostType, UserRoles } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CommentService } from './comment.service';
import { AddReactionsDto } from './dtos/add-reactions.dto';
import { CreateCommentDto } from './dtos/create-comment';
import { FindAllPostQuery } from './dtos/find-all-post.query.dto';
import { PinUnpinDto } from './dtos/pin-unpin-post.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { UpdateReactionsDto } from './dtos/update-reaction.dto';
import { PostsService } from './posts.service';
import { ReactionService } from './reaction.service';

@Controller('post')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly userService: UsersService,
    private readonly commentService: CommentService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationService: NotificationService,
    private readonly reactionService: ReactionService,
    private readonly groupService: GroupService,
    private readonly moderatorService: ModeratorService
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
    const options = { sort: { pin: -1, ...$q.sort }, limit: $q.limit, skip: $q.skip };
    const followings = (await this.userService.findAllRecords({ friends: { $in: [user._id] } }).select('_id')).map((user) => user._id);
    // find all groups that user has joined
    const groups = (await this.groupService.findAllRecords({ 'members.member': user._id })).map((group) => group._id);
    const condition = {
      creator: { $nin: [user.blockedUsers] },
      isBlocked: false,
      status: PostStatus.ACTIVE,
      $or: [
        { creator: user._id },
        { privacy: PostPrivacy.FOLLOWERS, creator: { $in: followings } },
        { group: { $in: groups } },
        { type: PostType.FUNDRAISING, creator: { $in: followings } },
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
    const comment = await this.commentService.create({ content: body.content, creator: user._id, post: id });
    const post = await this.postsService.findOneRecordAndUpdate({ _id: id }, { $push: { comments: comment._id } });

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

    return comment;
  }

  @Put('comment/update')
  async updateComment(@Body() { commentId, content }: UpdateCommentDto) {
    return await this.commentService.update({ _id: commentId }, { content });
  }

  async isGroupModerator(postId: string, userId: string) {
    const post = await this.postsService.findOneRecord({ _id: postId });
    // check if post is not group post then throw exception
    if (!post.group) return false;
    const moderator = await this.moderatorService.findOneRecord({ group: post.group, user: userId });
    //check if user is moderator
    if (!moderator) return false;
    else return moderator;
  }

  @Delete(':postId/comment/:id/delete')
  async deleteComment(@Param('id', ParseObjectId) id: string, @Param('postId', ParseObjectId) postId: string, @GetUser() user: UserDocument) {
    const comment = await this.commentService.findOneRecord({ _id: id });
    if (!comment) throw new HttpException('Comment does not exist.', HttpStatus.BAD_REQUEST);
    if (comment.creator.toString() == user._id) {
      const deletedComment = await this.commentService.deleteSingleRecord({ _id: id });
      await this.postsService.findOneRecordAndUpdate({ _id: deletedComment.post }, { $pull: { comments: deletedComment._id } });
      return { message: 'Comment deleted successfully.' };
    } else {
      const moderator = await this.isGroupModerator(postId, user._id);
      if (!moderator || !moderator.deleteComments) throw new UnauthorizedException();
      const deletedComment = await this.commentService.deleteSingleRecord({ _id: id });
      await this.postsService.findOneRecordAndUpdate({ _id: deletedComment.post }, { $pull: { comments: deletedComment._id } });
      return { message: 'Comment deleted successfully.' };
    }
  }

  @Put(':id/update')
  async update(@Body() updatePostDto: UpdatePostDto, @Param('id', ParseObjectId) id: string) {
    return await this.postsService.update({ _id: id }, updatePostDto);
  }

  @Roles(UserRoles.ADMIN)
  @Put(':id/block-unblock')
  async block(@Param('id', ParseObjectId) id: string, @Query('block', ParseBoolPipe) block: boolean) {
    await this.postsService.findOneRecordAndUpdate({ _id: id }, { isBlocked: block === true ? true : false });
    return { message: `Post ${block === true ? 'blocked' : 'unblock'} successfully.` };
  }

  @Put(':id/pin-unpin')
  async pinUnpinPost(@Param('id', ParseObjectId) id: string, @Body() pinUnpinDto: PinUnpinDto, @GetUser() user: UserDocument) {
    const post = await this.postsService.findOne({ _id: id });

    if (!post) throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);

    if (post.creator.toString() == user._id || user.role.includes(UserRoles.ADMIN)) {
      await this.postsService.findOneRecordAndUpdate({ _id: id }, pinUnpinDto);
    } else {
      const moderator = await this.isGroupModerator(id, user._id);
      if (!moderator || !moderator.pinPosts) throw new UnauthorizedException();
      await this.postsService.findOneRecordAndUpdate({ _id: id }, pinUnpinDto);
    }
    return { message: `Post ${pinUnpinDto.pin ? 'pin' : 'un pin'} successfully.` };
  }

  // ====================================================================reactions apis===================================================================

  @Post('reaction/create')
  async addReactions(@Body() addReactionsDto: AddReactionsDto, @GetUser() user: UserDocument) {
    const post = await this.postsService.findOneRecord({ _id: addReactionsDto.post });
    if (!post) throw new HttpException('Post does not exists', HttpStatus.BAD_REQUEST);
    const reaction = await this.reactionService.createRecord({ user: user._id, emoji: addReactionsDto.emoji, post: post._id });
    await this.postsService.findOneRecordAndUpdate({ _id: post._id }, { $push: { reactions: reaction._id } });
    return reaction;
  }

  @Delete('reaction/:id/delete')
  async deleteReaction(@Param('id', ParseObjectId) id: string) {
    const reaction = await this.reactionService.deleteSingleRecord({ _id: id });
    if (!reaction) throw new HttpException('Reaction does not exists', HttpStatus.BAD_REQUEST);
    await this.postsService.findOneRecordAndUpdate({ _id: reaction.post }, { $pull: { reactions: reaction._id } });
    return reaction;
  }

  @Put('reaction/:id/update')
  async updateReaction(@Param('id', ParseObjectId) id: string, @Body() updateReactionsDto: UpdateReactionsDto) {
    return await this.reactionService.findOneRecordAndUpdate({ _id: id }, { emoji: updateReactionsDto.emoji });
  }

  @Get('tagged/find-all')
  async findTaggedPosts(@GetUser() user: UserDocument) {
    return await this.postsService.find({ tagged: { $in: [user._id] } });
  }
}
