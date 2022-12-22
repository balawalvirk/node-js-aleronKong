import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetUser, ParseObjectId, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService, private readonly stripeService: StripeService) {}

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument) {
    return await this.orderService.findAllRecords({ customer: user._id });
  }

  @Put(':id/fullfilled')
  async update(@Param('id', ParseObjectId) id: string) {
    const order = await this.orderService.findOne({ _id: id });
    await this.stripeService.updatePaymentIntent(order.paymentIntent, { transfer_group: order._id });
    for (const item of order.items) {
      await this.stripeService.createTransfer({
        amount: item.price,
        currency: 'usd',
        destination: item.item.creator.sellerId,
        transfer_group: order._id,
        description: `${item.item.title} transfers`,
      });
    }
    return { message: 'Order fullfilled successfully.' };
  }
}
