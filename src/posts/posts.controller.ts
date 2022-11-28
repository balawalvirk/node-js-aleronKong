import {
  Body,
  Controller,
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
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { PostStatus, PostType } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreateCommentDto } from './dtos/create-comment';
import { Posts } from './posts.schema';
import { PostsService } from './posts.service';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService, private usersService: UsersService) {}

  //find all post that are on feeds
  @Get('find-all')
  async findAll(@GetUser() user: UserDocument, @Query('privacy') privacy: string) {
    return await this.postsService.findAllPosts({
      privacy,
      blockers: { $nin: [user._id] },
    });
  }

  @Get('find-all/mine')
  async findMine(@GetUser() user: UserDocument) {
    return await this.postsService.findAllPosts({
      creator: user._id,
    });
  }

  @Post('like/:postId')
  async addLike(@Param('postId') postId: string, @GetUser() user: UserDocument): Promise<Posts> {
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
  async blockPost(@Param('postId') postId: string, @GetUser() user: UserDocument) {
    return await this.postsService.findOneRecordAndUpdate(
      { _id: postId },
      {
        $push: { blockers: user._id },
      }
    );
  }

  @Put('report/:id')
  async reportPost(
    @Param('id') id: string,
    @GetUser() user: UserDocument,
    @Body('reason') reason: string
  ) {
    const updatedPost = await this.postsService.findOneRecordAndUpdate(
      { _id: id },
      { $push: { reports: { reporter: user._id, reason } } }
    );
    if (!updatedPost) throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    return { message: 'Report submitted successfully.' };
  }
}
