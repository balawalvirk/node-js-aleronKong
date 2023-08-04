import { Controller, Get, Post, Body, Param, UseGuards, Put, BadRequestException, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { GetUser, makeQuery, PaginationDto, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostsService } from 'src/posts/posts.service';
import { FindAllPagesQueryDto } from './dto/find-all-pages.query.dto';
import { PageFilter } from 'src/types';

@Controller('page')
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(private readonly pageService: PageService, private readonly postService: PostsService) {}

  @Post('create')
  async create(@Body() createPageDto: CreatePageDto, @GetUser() user: UserDocument) {
    return await this.pageService.createRecord({ ...createPageDto, creator: user._id });
  }

  @Get(':id/find-one')
  async findOne(@Param('id', ParseObjectId) id: string) {
    return await this.pageService.findOneRecord({ _id: id });
  }

  @Put(':id/update')
  async update(@Param('id', ParseObjectId) id: string, @Body() updatePageDto: UpdatePageDto) {
    return await this.pageService.findOneRecordAndUpdate({ _id: id }, updatePageDto);
  }

  @Get('find-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() { filter, query, limit, page }: FindAllPagesQueryDto) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, sort: $q.sort };
    if (filter === PageFilter.ALL) {
      return await this.pageService.findAllRecords({ name: { $regex: query, $options: 'i' } }, options);
    }

    if (filter === PageFilter.POPULAR) {
      return await this.pageService.findAllRecords({ name: { $regex: query, $options: 'i' } }, options);
    }

    if (filter === PageFilter.LATEST) {
      return await this.pageService.findAllRecords({ name: { $regex: query, $options: 'i' } }, options);
    }

    if (filter === PageFilter.SUGGESTED) {
      return await this.pageService.findAllRecords({ name: { $regex: query, $options: 'i' } }, options);
    }
  }

  //find pages of a specific user
  @Get('find-all/user/:id')
  async findUserPages(@Param('id', ParseObjectId) id: string, @Query() { page, limit }: PaginationDto) {
    const $q = makeQuery({ page, limit });
    const condition = { creator: id };
    const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
    const total = await this.pageService.countRecords(condition);
    const pages = await this.pageService.findAllRecords(condition, options);
    const paginated = {
      total,
      pages: Math.round(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: pages,
    };
    return paginated;
  }

  @Put(':id/follow')
  async follow(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const page = await this.pageService.findOneRecord({ _id: id });
    if (!page) throw new BadRequestException('Page does not exists.');

    //check if user is already a follower of this page
    //@ts-ignore
    const followerFound = page.followers.find((follower) => follower.follower.equals(user._id));
    if (followerFound) throw new BadRequestException('You are already a follower of this page.');
    return await this.pageService.findOneRecordAndUpdate({ _id: id }, { $push: { followers: { follower: user._id } } });
  }

  @Put(':id/un-follow')
  async unFollow(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    return await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { followers: { follower: user._id } } });
  }

  @Get('follow/find-all')
  async findAllfollowedPages(@GetUser() user: UserDocument) {
    return await this.pageService.findAllRecords({ 'followers.follower': user._id });
  }

  // find all post of page that user follow
  @Get('follow/post/find-all')
  async feed(@GetUser() user: UserDocument, @Query() { page, limit }: PaginationDto) {
    const $q = makeQuery({ page, limit });
    const options = { sort: { pin: -1, ...$q.sort }, limit: $q.limit, skip: $q.skip };
    const pages = (await this.pageService.findAllRecords({ 'followers.follower': user._id })).map((follower) => follower._id);
    const condition = { page: { $in: pages }, creator: { $nin: user.blockedUsers } };
    const posts = await this.postService.find(condition, options);
    const total = await this.postService.countRecords(condition);
    const paginated = {
      total,
      pages: Math.floor(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }

  @Get(':id/follower/find-all')
  async findAllFollowers(@Param('id', ParseObjectId) id: string) {
    return await this.pageService.findAllFollowers({ _id: id });
  }

  // find posts of specfic page
  @Get(':id/post/find-all')
  async findPostsOfPage(@Param('id', ParseObjectId) id: string, @Query() { limit, page }: PaginationDto, @GetUser() user: UserDocument) {
    const $q = makeQuery({ page, limit });
    const options = { sort: { feature: -1, pin: -1, ...$q.sort }, limit: $q.limit, skip: $q.skip };
    const condition = { page: id, creator: { $nin: user.blockedUsers } };
    const posts = await this.postService.find(condition, options);
    const total = await this.postService.countRecords(condition);
    const paginated = {
      total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: posts,
    };
    return paginated;
  }
}
