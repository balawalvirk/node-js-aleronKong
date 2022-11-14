import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('create')
  async createAddress(@Body() createAddressDto: CreateAddressDto, @GetUser() user: UserDocument) {
    return await this.addressService.createRecord({ ...createAddressDto, creator: user._id });
  }

  @Get('find-all')
  async findAllAddress(@GetUser() user: UserDocument) {
    return await this.addressService.findAllRecords({ creator: user._id });
  }

  @Delete(':id/delete')
  async deleteAddress(@Param('id', ParseObjectId) id: string) {
    return await this.addressService.deleteSingleRecord({ _id: id });
  }

  @Patch(':id/update')
  async updateAddress(@Param('id', ParseObjectId) id: string, updateAddressDto: UpdateAddressDto) {
    return await this.addressService.findOneRecordAndUpdate({ _id: id }, updateAddressDto);
  }
}
