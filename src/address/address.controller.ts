import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService, private readonly userService: UsersService) {}

  @Post('create')
  async create(@Body() createAddressDto: CreateAddressDto, @GetUser() user: UserDocument) {
    return await this.addressService.createRecord({ ...createAddressDto, creator: user._id });
  }

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument) {
    return await this.addressService.findAllRecords({ creator: user._id });
  }

  @Get(':id/find-one')
  async findOne(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    return await this.addressService.findOneRecord({ _id: id });
  }

  @Delete(':id/delete')
  async delete(@Param('id', ParseObjectId) id: string) {
    return await this.addressService.deleteSingleRecord({ _id: id });
  }

  @Patch(':id/update')
  async update(@Param('id', ParseObjectId) id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return await this.addressService.findOneRecordAndUpdate({ _id: id }, updateAddressDto);
  }

  @Put(':id/default')
  async default(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const address = await this.addressService.findOneRecord({ _id: id });
    if (!address) throw new HttpException('Address not found', HttpStatus.BAD_REQUEST);
    await this.userService.findOneRecordAndUpdate({ _id: user._id }, { defaultAddress: id });
    return 'Default address added to customer account.';
  }
}
