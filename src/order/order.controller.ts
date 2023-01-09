import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetUser, ParseObjectId, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderStatus } from 'src/types';
import { FindAllQueryDto } from './dto/find-all-query.dto';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService, private readonly stripeService: StripeService) {}

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument, @Query() findAllQueryDto: FindAllQueryDto) {
    return await this.orderService.findAll({ customer: user._id, ...findAllQueryDto });
  }

  @Get(':id/find-one')
  async findOne(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    const order = await this.orderService.findOne({ _id: id });
    if (!order) throw new HttpException('Order does not exists.', HttpStatus.BAD_REQUEST);
    const paymentMethod = await this.stripeService.findOnePaymentMethod(order.paymentMethod);
    const subTotal = order.product.price * order.quantity;
    const tax = Math.round((2 / 100) * subTotal);
    const total = subTotal + tax;
    return { ...order, total, tax, subTotal, paymentMethod };
  }

  @Put(':id/update')
  async update(@Param('id', ParseObjectId) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.orderService.findOneAndUpdate({ _id: id }, updateOrderDto);
    // check if order status is completed then transfer the amount to seller account.
    if (order.status === OrderStatus.COMPLETED) {
      const subTotal = order.product.price * order.quantity;
      const tax = Math.round((2 / 100) * subTotal);
      const total = subTotal + tax;
      const amount = Math.round((2 / 100) * total);
      await this.stripeService.createTransfer({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: order.product.creator.sellerId,
        transfer_group: order._id,
        description: `${order.product.title} payment transfer.`,
      });
      //check if order status is cancel then refund payment back to customer
    } else if (order.status === OrderStatus.CANCELED) {
      await this.stripeService.createRefund({ payment_intent: order.paymentIntent });
    }
    return order;
  }
}
