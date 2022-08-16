import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentDocument } from 'src/posts/comments/comments.schema';
import { CommentsService } from 'src/posts/comments/comments.service';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreatePostsDto } from './dtos/create-posts';
import { Posts } from './posts.schema';
import { PostsService } from './posts.service';
import { CreateCommentDto } from './comments/dto/create-comments';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private usersService: UsersService,
    private commentsService: CommentsService
  ) {}

  @Post('create')
  async create(@Body() body: CreatePostsDto, @GetUser() user: UserDocument): Promise<Posts> {
    return await this.postsService.create({ creator: user._id, ...body });
  }

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument): Promise<Posts[]> {
    return await this.postsService.findAllPosts(user._id);
  }

  @Put('like/:postId')
  async addLike(@Param('postId') postId: string, @GetUser() user: UserDocument): Promise<Posts> {
    const userFound = await this.usersService.findOne({ _id: user._id });
    if (userFound)
      throw new HttpException('You cannot like your own post.', HttpStatus.BAD_REQUEST);
    return await this.postsService.updatePost(postId, { $push: { likes: user._id } });
  }

  @Put('comment/:postId')
  async createComment(
    @Param('postId') postId: string,
    @GetUser() user: UserDocument,
    @Body() body: CreateCommentDto
  ): Promise<Posts> {
    const comment: CommentDocument = await this.commentsService.create({
      creator: user._id,
      ...body,
    });
    return await this.postsService.updatePost(postId, { $push: { comments: comment._id } });
  }
}
