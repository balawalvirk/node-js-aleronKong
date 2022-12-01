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

@Controller('fudraising')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FudraisingController {
  constructor(
    private readonly postService: PostsService,
    private readonly categoryService: FudraisingCategoryService,
    private readonly subCategoryService: FudraisingSubCategoryService
  ) {}

  @Post('create')
  async createFundraiser(createFudraisingDto: CreateFudraisingDto, @GetUser() user: UserDocument) {
    await this.postService.createRecord({
      ...createFudraisingDto,
      creator: user._id,
      type: PostType.FUNDRAISING,
      status: PostStatus.INACTIVE,
      privacy: PostPrivacy.PUBLIC,
    });
  }

  @Roles(UserRole.ADMIN)
  @Post('category/create')
  async createCategory(@Body() createFudraisingCategoryDto: CreateFudraisingCategoryDto) {
    return await this.categoryService.createRecord(createFudraisingCategoryDto);
  }

  @Get('category/find-all')
  async findAllCategories() {
    return await this.categoryService.findAllRecords();
  }

  @Roles(UserRole.ADMIN)
  @Delete('category/:id/delete')
  async deleteCategory(@Param('id', ParseObjectId) id: string) {
    return await this.categoryService.deleteSingleRecord({ _id: id });
  }

  @Roles(UserRole.ADMIN)
  @Post('sub-category/create')
  async createSubCategory(@Body() createFudraisingSubCategoryDto: CreateFudraisingSubCategoryDto) {
    return await this.subCategoryService.createRecord(createFudraisingSubCategoryDto);
  }

  @Get('sub-category/find-all')
  async findAllSubCategories() {
    return await this.subCategoryService.findAllRecords();
  }

  @Roles(UserRole.ADMIN)
  @Delete('sub-category/:id/delete')
  async deleteSubCategory(@Param('id', ParseObjectId) id: string) {
    return await this.subCategoryService.deleteSingleRecord({ _id: id });
  }
}
