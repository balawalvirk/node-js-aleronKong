import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreateCommentDto } from './dtos/create-comment';
import { CreatePostsDto } from './dtos/create-posts';
import { Posts } from './posts.schema';
import { PostsService } from './posts.service';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private usersService: UsersService
  ) {}

  @Post('create')
  async create(
    @Body() body: CreatePostsDto,
    @GetUser() user: UserDocument
  ): Promise<Posts> {
    return await this.postsService.create({ creator: user._id, ...body });
  }

  //find all post that are on feeds
  @Get('find-all')
  async findAll(
    @GetUser() user: UserDocument,
    @Query('privacy') privacy: string
  ): Promise<Posts[]> {
    return await this.postsService.findAllPosts({
      privacy,
      blockers: { $nin: [user._id] },
    });
  }

  @Get('find-all/mine')
  async findMine(@GetUser() user: UserDocument): Promise<Posts[]> {
    return await this.postsService.findAllPosts({
      creator: user._id,
    });
  }

  @Post('like/:postId')
  async addLike(
    @Param('postId') postId: string,
    @GetUser() user: UserDocument
  ): Promise<Posts> {
    await this.usersService.findOneRecord({ _id: user._id });
    return await this.postsService.updatePost(postId, {
      $push: { likes: user._id },
    });
  }

  @Post('comment/:postId')
  async createComment(
    @Param('postId') postId: string,
    @GetUser() user: UserDocument,
    @Body() body: CreateCommentDto
  ): Promise<Posts> {
    return await this.postsService.updatePost(postId, {
      $push: { comments: { content: body.content, creator: user._id } },
    });
  }

  @Put('block/:postId')
  async blockPost(
    @Param('postId') postId: string,
    @GetUser() user: UserDocument
  ) {
    return await this.postsService.findAndUpdate(
      { _id: postId },
      {
        $push: { blockers: user._id },
      }
    );
  }

  @Put('report/:postId')
  async reportPost(
    @Param('postId') postId: string,
    @GetUser() user: UserDocument
  ) {
    return await this.postsService.findAndUpdate(
      { _id: postId },
      { reporter: user._id }
    );
  }
}
