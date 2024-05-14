import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import {BenefitService} from "src/benefits/benefit.service";
import {CreateBenefitDto} from "src/benefits/dto/create-benefit.dto";
import {UpdateBenefitDto} from "src/benefits/dto/update-benefit.dto";
import mongoose from "mongoose";
import getThumb from 'video-thumbnail-url';

@Controller('benefit')
@UseGuards(JwtAuthGuard)
export class BenefitController {
  constructor(private readonly benefitService: BenefitService) {}


    @Get('/thumbnail')
    async thumbnail(@GetUser() user: UserDocument) {
        getThumb('https://middler-v1.s3.amazonaws.com/Snapsave.app_46461856ACBDBDC92CD5E621D4A556A3_video_dashinit.mp4').then(thumb_url => { // thumb_url is  url or null
            console.log(thumb_url); // http://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg
        });

    }

  @Post('create')
  async create(@Body() createAddressDto: CreateBenefitDto, @GetUser() user: UserDocument) {
    return await this.benefitService.createRecord({ ...createAddressDto });
  }

  @Get('guild/:guildId/find-all')
  async findAll(@GetUser() user: UserDocument,@Param('guildId', ParseObjectId) id: string) {
    return await this.benefitService.findAllRecords({ guild: new mongoose.Types.ObjectId(id) });
  }

  @Get(':id/find-one')
  async findOne(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    return await this.benefitService.findOneRecord({ _id: id });
  }

  @Delete(':id/delete')
  async delete(@Param('id', ParseObjectId) id: string) {
    return await this.benefitService.deleteSingleRecord({ _id: id });
  }

  @Patch(':id/update')
  async update(@Param('id', ParseObjectId) id: string, @Body() updateAddressDto: UpdateBenefitDto) {
    return await this.benefitService.findOneRecordAndUpdate({ _id: id }, updateAddressDto);
  }

}
