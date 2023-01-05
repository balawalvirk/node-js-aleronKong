import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { CreateFudraisingDto } from './dtos/create-fudraising.dto';
import { PostsService } from 'src/posts/posts.service';
import { PostPrivacy, PostStatus, PostType, SaleType, UserRole } from 'src/types';
import { GetUser, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CreateFudraisingCategoryDto } from './dtos/create-category';
import { CreateFudraisingSubCategoryDto } from './dtos/create-subCategory';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { FudraisingCategoryService } from './category.service';
import { FudraisingSubCategoryService } from './subcategory.service';
import { FudraisingService } from './fundraising.service';
import { FundraisingDocument } from './fundraising.schema';
import { FundProjectDto } from './dtos/fund-project.dto';
import { SaleService } from 'src/sale/sale.service';

@Controller('fundraising')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FudraisingController {
  constructor(
    private readonly postService: PostsService,
    private readonly categoryService: FudraisingCategoryService,
    private readonly subCategoryService: FudraisingSubCategoryService,
    private readonly fundraisingService: FudraisingService,
    private readonly stripeService: StripeService,
    private readonly saleService: SaleService
  ) {}

  @Post('create')
  async createFundraiser(@Body() createFudraisingDto: CreateFudraisingDto, @GetUser() user: UserDocument) {
    const fundraising: FundraisingDocument = await this.fundraisingService.createRecord(createFudraisingDto);
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

  @Post('fund')
  async fundProject(@Body() { amount, projectId, paymentMethod }: FundProjectDto, @GetUser() user: UserDocument) {
    const post = await this.postService.findOne({ fundraising: projectId });
    if (!post) throw new HttpException('Fundraising project does not exists.', HttpStatus.BAD_REQUEST);
    await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: paymentMethod,
      amount: Math.round(amount * 100),
      customer: user.customerId,
      confirm: true,
      application_fee_amount: Math.round((2 / 100) * amount),
      transfer_data: {
        destination: post.creator.sellerId,
      },
      description: `funding of funraiser project by ${user.firstName} ${user.lastName}`,
    });
    await this.saleService.createRecord({
      fundraising: projectId,
      type: SaleType.FUNDRAISING,
      price: amount,
      customer: user._id,
    });
    await this.fundraisingService.findOneRecordAndUpdate(
      { _id: projectId },
      { $inc: { currentFunding: amount, backers: 1 } }
    );
    post.fundraising.backers += 1;
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
