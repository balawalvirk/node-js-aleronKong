import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CartDocument } from './cart.schema';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('find-one')
  async findOne(@GetUser() user: UserDocument) {
    return await this.cartService.findOne({ creator: user._id });
  }

  @Post('item/add')
  async addItem(@GetUser() user: UserDocument, @Body() createCartDto: CreateCartDto) {
    const cart = await this.cartService.findOneRecord({ creator: user._id });
    // check if item is added first time then create a cart object.
    if (!cart) {
      return await this.cartService.createRecord({
        creator: user._id,
        items: [
          {
            item: createCartDto.item,
            quantity: createCartDto.quantity || 1,
          },
        ],
      });
      // otherwise add item in items array
    } else {
      const item = cart.items.find((item) => item.item == createCartDto.item);
      if (item)
        throw new HttpException('You already added this item in cart.', HttpStatus.BAD_REQUEST);
      return await this.cartService.findOneRecordAndUpdate(
        { creator: user._id },
        { $push: { items: { item: createCartDto.item, quantity: createCartDto.quantity || 1 } } }
      );
    }
  }

  @Post('item/:id/remove')
  async removeProduct(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    return await this.cartService.findOneRecordAndUpdate(
      { creator: user._id },
      { $pull: { items: { item: id } } }
    );
  }

  @Post(':id/inc-dec')
  async addProduct(
    @Param('id', ParseObjectId) id: string,
    @GetUser() user: UserDocument,
    @Query('quantity', ParseIntPipe) quantity: string
  ) {
    return await this.cartService.findOneRecordAndUpdate(
      { 'items.item': id, creator: user._id },
      { 'items.$.quantity': quantity }
    );
  }
}
