import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import {BenefitService} from "src/benefits/benefit.service";
import {CreateBenefitDto} from "src/benefits/dto/create-benefit.dto";
import {UpdateBenefitDto} from "src/benefits/dto/update-benefit.dto";
import mongoose from "mongoose";
import {ContactUsService} from "src/contact-us/contact-us.service";
import {CreateContactusDto} from "src/contact-us/dto/create-contactus.dto";

@Controller('contact-us')
@UseGuards(JwtAuthGuard)
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post('create')
  async create(@Body() payload: CreateContactusDto, @GetUser() user: UserDocument) {
    return await this.contactUsService.createRecord({ ...payload });
  }

}
