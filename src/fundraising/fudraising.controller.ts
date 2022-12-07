import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateFudraisingDto } from './dtos/create-fudraising.dto';
import { PostsService } from 'src/posts/posts.service';
import { PostPrivacy, PostStatus, PostType, UserRole } from 'src/types';
import { GetUser, ParseObjectId, Roles } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CreateFudraisingCategoryDto } from './dtos/create-category';
import { CreateFudraisingSubCategoryDto } from './dtos/create-subCategory';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { FudraisingCategoryService } from './category.service';
import { FudraisingSubCategoryService } from './subcategory.service';
import { FudraisingService } from './fundraising.service';
import { FundraisingDocument } from './fundraising.schema';

@Controller('fundraising')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FudraisingController {
  constructor(
    private readonly postService: PostsService,
    private readonly categoryService: FudraisingCategoryService,
    private readonly subCategoryService: FudraisingSubCategoryService,
    private readonly fundraisingService: FudraisingService
  ) {}

  @Post('create')
  async createFundraiser(
    @Body() createFudraisingDto: CreateFudraisingDto,
    @GetUser() user: UserDocument
  ) {
    const fundraising: FundraisingDocument = await this.fundraisingService.createRecord(
      createFudraisingDto
    );
    const post = await this.postService.createPost({
      fundraising: fundraising._id,
      creator: user._id,
      type: PostType.FUNDRAISING,
      /**
       * TODO : change statua to inactive as it will be approved from admin
       */
      status: PostStatus.ACTIVE,
      privacy: PostPrivacy.PUBLIC,
    });
    return post;
  }

  // @Roles(UserRole.ADMIN)
  @Post('category/create')
  async createCategory(@Body() createFudraisingCategoryDto: CreateFudraisingCategoryDto) {
    return await this.categoryService.createRecord(createFudraisingCategoryDto);
  }

  @Get('category/find-all')
  async findAllCategories() {
    return await this.categoryService.findAllRecords();
  }

  // @Roles(UserRole.ADMIN)
  @Delete('category/:id/delete')
  async deleteCategory(@Param('id', ParseObjectId) id: string) {
    return await this.categoryService.deleteSingleRecord({ _id: id });
  }

  // @Roles(UserRole.ADMIN)
  @Post('sub-category/create')
  async createSubCategory(@Body() createFudraisingSubCategoryDto: CreateFudraisingSubCategoryDto) {
    return await this.subCategoryService.createRecord(createFudraisingSubCategoryDto);
  }

  @Get('sub-category/find-all/:categoryId')
  async findAllSubCategories(@Param('categoryId', ParseObjectId) categoryId: string) {
    return await this.subCategoryService.findAllRecords({ category: categoryId });
  }

  // @Roles(UserRole.ADMIN)
  @Delete('sub-category/:id/delete')
  async deleteSubCategory(@Param('id', ParseObjectId) id: string) {
    return await this.subCategoryService.deleteSingleRecord({ _id: id });
  }
}
