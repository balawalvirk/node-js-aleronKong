import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { FudraisingService } from './fudraising.service';
import { CreateFudraisingDto } from './dtos/create-fudraising.dto';
import { PostsService } from 'src/posts/posts.service';
import { PostStatus, PostType, UserRole } from 'src/types';
import { GetUser, Roles } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CreateFudraisingCategoryDto } from './dtos/create-category';
import { CreateFudraisingSubCategoryDto } from './dtos/create-subCategory';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';

@Controller('fudraising')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FudraisingController {
  constructor(
    private readonly fudraisingService: FudraisingService,
    private readonly postService: PostsService
  ) {}

  @Post('create')
  async createFundraiser(createFudraisingDto: CreateFudraisingDto, @GetUser() user: UserDocument) {
    await this.postService.createRecord({
      ...createFudraisingDto,
      creator: user._id,
      type: PostType.FUNDRAISING,
      status: PostStatus.INACTIVE,
    });
  }

  @Roles(UserRole.ADMIN)
  @Post('category/create')
  async createCategory(@Body() createFudraisingCategoryDto: CreateFudraisingCategoryDto) {
    return await this.fudraisingService.createCategory(createFudraisingCategoryDto);
  }

  @Roles(UserRole.ADMIN)
  @Post('sub-category/create')
  async createSubCategory(@Body() createFudraisingSubCategoryDto: CreateFudraisingSubCategoryDto) {
    return await this.fudraisingService.createSubCategory(createFudraisingSubCategoryDto);
  }
}
