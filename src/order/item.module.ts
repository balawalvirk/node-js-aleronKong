import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderItem, OrderItemSchema } from './item.schema';
import { OrderItemService } from './item.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: OrderItem.name, schema: OrderItemSchema }])],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
