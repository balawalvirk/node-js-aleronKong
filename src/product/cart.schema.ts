import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/users.schema';

export type CartDocument = Cart & mongoose.Document;

@Schema({ versionKey: false, _id: false })
class Item {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  item: Product;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: [ItemSchema] })
  items: Item[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
