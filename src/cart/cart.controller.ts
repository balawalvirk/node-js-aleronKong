import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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

  @Post('add-remove')
  async addProduct(@Body() createCartDto: CreateCartDto, @GetUser() user: UserDocument) {
    const cart: CartDocument = await this.cartService.findOneRecord({ creator: user._id });
    if (!cart) {
      return await this.cartService.createRecord({
        creator: user._id,

        items: [{ item: createCartDto.item, quantity: createCartDto.quantity || 1 }],
      });
    } else {
      return await this.cartService.findOneRecordAndUpdate(
        { 'items.item': createCartDto.item },
        { 'items.$.quantity': createCartDto.quantity }
      );
    }
  }

  @Post('product/:id/remove')
  async removeProduct(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    return await this.cartService.findOneRecordAndUpdate(
      { creator: user._id },
      { $pull: { 'products.product': id } }
    );
  }
}
