import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put } from '@nestjs/common';
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

  // @Get()
  // findAll() {
  //   return this.pageService.findAll();
  // }

  @Get(':id/find-one')
  async findOne(@Param('id', ParseObjectId) id: string) {
    return await this.pageService.findOneRecord({ _id: id });
  }

  @Put(':id/update')
  async update(@Param('id', ParseObjectId) id: string, @Body() updatePageDto: UpdatePageDto) {
    return await this.pageService.findOneRecordAndUpdate({ _id: id }, updatePageDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.pageService.remove(+id);
  // }
}
