import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { StripeService } from 'src/helpers';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), ReviewModule],
  controllers: [OrderController],
  providers: [OrderService, StripeService],
  exports: [OrderService],
})
export class OrderModule {}
