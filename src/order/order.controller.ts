import { Controller, Get, Post, Body, Param, UseGuards, Put, HttpException, HttpStatus, Query, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetUser, makeQuery, ParseObjectId, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderStatus } from 'src/types';
import { FindAllOrderQueryDto } from './dto/find-all-query.dto';
import { ReviewService } from 'src/review/review.service';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stripeService: StripeService,
    private readonly reviewService: ReviewService
  ) {}

  @Get('find-all')
  async findAll(@Query() { page, limit, ...rest }: FindAllOrderQueryDto) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const orders = await this.orderService.find(rest, options);
    const total = await this.orderService.countRecords(rest);
    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: orders,
    };
    return paginated;
  }

  @Get(':id/find-one')
  async findOne(@Param('id', ParseObjectId) id: string) {
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

  @Delete(':id/delete')
  async delete(@Param('id', ParseObjectId) id: string) {
    await this.orderService.deleteSingleRecord({ _id: id });
    return { message: 'Order deleted successfully.' };
  }

  @Get(':id/review/find-all')
  async findReviews(@Param('id', ParseObjectId) id: string) {
    return await this.reviewService.find({ order: id });
  }
}
