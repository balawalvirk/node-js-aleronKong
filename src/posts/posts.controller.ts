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
import { RolesGuard } from 'src/auth/role.guard';
import { ParseObjectId, Roles } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserRole } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreateCommentDto } from './dtos/create-comment';
import { PostDocument, Posts } from './posts.schema';
import { PostsService } from './posts.service';

@Controller('post')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(private postsService: PostsService, private usersService: UsersService) {}

  //find all post that are on feeds
  @Get('find-all')
  async findAll(@GetUser() user: UserDocument, @Query('privacy') privacy: string) {
    let posts: PostDocument[];
    // check if role is user
    if (user.role.includes(UserRole.ADMIN)) {
      posts = await this.postsService.findAllRecords();
    } else {
      posts = await this.postsService.findAllPosts({
        privacy,
        blockers: { $nin: [user._id] },
      });
    }
    return posts;
  }

  @Get('find-all/mine')
  async findMine(@GetUser() user: UserDocument) {
    return await this.postsService.findAllPosts({
      creator: user._id,
    });
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
  async createComment(
    @Param('postId') postId: string,
    @GetUser() user: UserDocument,
    @Body() body: CreateCommentDto
  ): Promise<Posts> {
    return await this.postsService.updatePost(postId, {
      $push: { comments: { content: body.content, creator: user._id } },
    });
  }

  @Put('block/:id')
  async blockPost(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    // check if role is user
    if (user.role.includes(UserRole.ADMIN)) {
      await this.postsService.findOneRecordAndUpdate({ _id: id }, { isBlocked: true });
      return { message: 'Post blocked successfully.' };
    } else {
      return await this.postsService.findOneRecordAndUpdate(
        { _id: id },
        {
          $push: { blockers: user._id },
        }
      );
    }
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
