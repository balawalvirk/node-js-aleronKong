import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpException, HttpStatus, Query, Put, BadRequestException } from '@nestjs/common';
import { CreateFudraisingDto } from './dtos/create-fudraising.dto';
import { PostsService } from 'src/posts/posts.service';
import { NotificationType, PostPrivacy, PostStatus, PostType, UserRoles } from 'src/types';
import { GetUser, makeQuery, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CreateFudraisingCategoryDto } from './dtos/create-category';
import { CreateFudraisingSubCategoryDto } from './dtos/create-subCategory';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { FudraisingCategoryService } from './category.service';
import { FudraisingSubCategoryService } from './subcategory.service';
import { FundraisingService } from './fundraising.service';
import { FundProjectDto } from './dtos/fund-project.dto';
import { FindAllFundraisingQueryDto } from './dtos/find-all-query.dto';
import { FundService } from './fund.service';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Controller('fundraising')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FundraisingController {
  constructor(
    private readonly postService: PostsService,
    private readonly categoryService: FudraisingCategoryService,
    private readonly subCategoryService: FudraisingSubCategoryService,
    private readonly fundraisingService: FundraisingService,
    private readonly stripeService: StripeService,
    private readonly fundService: FundService,
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post('create')
  async createFundraiser(@Body() createFudraisingDto: CreateFudraisingDto, @GetUser() user: UserDocument) {
    await this.fundraisingService.createRecord({
      ...createFudraisingDto,
      creator: user._id,
    });
    return { message: 'Your project has been submitted for review.' };
  }

  @Post('fund')
  async fundProject(@Body() { amount, projectId }: FundProjectDto, @GetUser() user: UserDocument) {
    if (!user.defaultPaymentMethod) throw new BadRequestException('User does not have default Payment method');
    const post = await this.postService.findOne({ fundraising: projectId });
    if (!post) throw new HttpException('Fundraising project does not exists.', HttpStatus.BAD_REQUEST);

    await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: user.defaultPaymentMethod,
      amount: Math.round(amount * 100),
      customer: user.customerId,
      confirm: true,
      application_fee_amount: Math.round((2 / 100) * amount),
      transfer_data: {
        destination: post.creator.sellerId,
      },
      description: `funding of funraiser project by ${user.firstName} ${user.lastName}`,
    });
    await this.fundService.createRecord({
      project: projectId,
      price: amount,
      donator: user._id,
      //@ts-ignore
      beneficiary: post.creator._id,
    });
    const project = await this.fundraisingService.findOneRecordAndUpdate({ _id: projectId }, { $inc: { currentFunding: amount, backers: 1 } });
    post.fundraising.backers = project.backers;
    post.fundraising.currentFunding = project.currentFunding;

    await this.notificationService.createRecord({
      post: post._id,
      sender: user._id,
      //@ts-ignore
      receiver: post.creator._id,
      message: `has funded ${amount}$ for your project`,
      type: NotificationType.FUNDRAISING_PROJECT_FUNDED,
    });

    await this.firebaseService.sendNotification({
      token: post.creator.fcmToken,
      notification: { title: `${post.creator.firstName} ${post.creator.lastName} has funded $${amount} for your project` },
      data: { post: post._id.toString(), type: NotificationType.FUNDRAISING_PROJECT_FUNDED },
    });

    return post;
  }

  @Roles(UserRoles.ADMIN)
  @Get('find-all')
  async findAll(@Query() { query, page, limit }: FindAllFundraisingQueryDto) {
    const $q = makeQuery({ page: page, limit: limit });
    const rjx = { $regex: query ? query : '', $options: 'i' };
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const condition = { title: rjx, type: PostType.FUNDRAISING };
    const total = await this.fundraisingService.countRecords(condition);
    const projects = await this.fundraisingService.findAllRecords(condition, options);
    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: projects,
    };
    return paginated;
  }

  @Roles(UserRoles.ADMIN)
  @Put(':id/approve')
  async approve(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const project = await this.fundraisingService.findOneRecordAndUpdate({ _id: id }, { isApproved: true }).populate('creator');
    const postFound = await this.postService.findOneRecord({ fundraising: project._id });
    if (postFound) throw new HttpException('This project is already approved.', HttpStatus.BAD_REQUEST);
    const post = await this.postService.createRecord({
      fundraising: project._id,
      //@ts-ignore
      creator: project.creator._id,
      type: PostType.FUNDRAISING,
      status: PostStatus.ACTIVE,
      privacy: PostPrivacy.PUBLIC,
    });

    await this.notificationService.createRecord({
      post: post._id,
      sender: user._id,
      //@ts-ignore
      receiver: project.creator._id,
      message: `Your fundraising project has been approved`,
      type: NotificationType.FUNDRAISING_PROJECT_APPROVED,
    });

    if (project.creator.fcmToken) {
      await this.firebaseService.sendNotification({
        token: project.creator.fcmToken,
        notification: { title: `Your fundraising project has been approved` },
        data: { post: post._id.toString(), type: NotificationType.FUNDRAISING_PROJECT_APPROVED },
      });
    }

    return { message: 'Fundraising project approved successfully.' };
  }

  @Roles(UserRoles.ADMIN)
  @Post('category/create')
  async createCategory(@Body() createFudraisingCategoryDto: CreateFudraisingCategoryDto) {
    return await this.categoryService.createRecord(createFudraisingCategoryDto);
  }

  @Get('category/find-all')
  async findAllCategories() {
    return await this.categoryService.findAllRecords();
  }

  @Roles(UserRoles.ADMIN)
  @Delete('category/:id/delete')
  async deleteCategory(@Param('id', ParseObjectId) id: string) {
    return await this.categoryService.deleteSingleRecord({ _id: id });
  }

  @Roles(UserRoles.ADMIN)
  @Post('sub-category/create')
  async createSubCategory(@Body() createFudraisingSubCategoryDto: CreateFudraisingSubCategoryDto) {
    return await this.subCategoryService.createRecord(createFudraisingSubCategoryDto);
  }

  @Get('sub-category/find-all/:categoryId')
  async findAllSubCategories(@Param('categoryId', ParseObjectId) categoryId: string) {
    return await this.subCategoryService.findAllRecords({ category: categoryId });
  }

  @Roles(UserRoles.ADMIN)
  @Delete('sub-category/:id/delete')
  async deleteSubCategory(@Param('id', ParseObjectId) id: string) {
    return await this.subCategoryService.deleteSingleRecord({ _id: id });
  }
}
