import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './collection.schema';
import { CollectionService } from './collection.service';
import { StripeService } from 'src/helpers';
import { AddressModule } from 'src/address/address.module';
import { ProductCategory, ProductCategorySchema } from './category.schema';
import { ProductCategoryService } from './category.service';
import { Cart, CartSchema } from './cart.schema';
import { CartService } from './cart.service';
import { OrderModule } from 'src/order/order.module';
import { SaleModule } from 'src/sale/sale.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]),
    MongooseModule.forFeature([{ name: ProductCategory.name, schema: ProductCategorySchema }]),
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    AddressModule,
    OrderModule,
    SaleModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CollectionService, StripeService, ProductCategoryService, CartService],
  exports: [ProductService, CartService],
})
export class ProductModule {}
