import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { makeQuery, ParseObjectId, Roles } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { MuteInterval, PostPrivacy, PostStatus, UserRole } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { CreateCommentDto } from './dtos/create-comment';
import { MutePostDto } from './dtos/mute-post.dto';
import { PostsService } from './posts.service';

@Controller('post')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Roles(UserRole.ADMIN)
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
  async findUserPost(@Param('id', ParseObjectId) id: string) {
    return await this.postsService.findAllPosts({ creator: id });
  }

  @Get('home')
  async findFeedPosts(@Query('page') page: string, @Query('limit') limit: string, @GetUser() user: UserDocument) {
    const $q = makeQuery({ page, limit });
    const condition = {
      privacy: PostPrivacy.PUBLIC,
      creator: { $nin: user.blockedUsers },
      isBlocked: false,
      status: PostStatus.ACTIVE,
    };
    const options = { limit: $q.limit, skip: $q.skip };
    const total = await this.postsService.countRecords({});
    const posts = await this.postsService.findAllPosts(condition, { options });
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
    const post = await this.postsService.findOneRecord({ _id: id, likes: { $in: [user._id] } });
    if (post) throw new HttpException('You already liked this post.', HttpStatus.BAD_REQUEST);
    return await this.postsService.updatePost(id, {
      $push: { likes: user._id },
    });
  }

  @Put('un-like/:id')
  async unLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    return await this.postsService.updatePost(id, { $pull: { likes: user._id } });
  }

  @Post('comment/:postId')
  async createComment(@Param('postId') postId: string, @GetUser() user: UserDocument, @Body() body: CreateCommentDto) {
    return await this.postsService.updatePost(postId, {
      $push: { comments: { content: body.content, creator: user._id } },
    });
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
