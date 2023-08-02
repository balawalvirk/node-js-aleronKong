import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('page')
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(private readonly pageService: PageService) {}

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
  async findAll(@GetUser() user: UserDocument) {
    return await this.pageService.findAllRecords({ 'followers.follower': user._id });
  }

  @Get(':id/follower/find-all')
  async findAllFollowers(@Param('id', ParseObjectId) id: string) {
    return await this.pageService.findAllFollowers({ _id: id });
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.pageService.remove(+id);
  // }
}
