import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './collection.schema';
import { CollectionService } from './collection.service';
import { StripeService } from 'src/helpers';
import { AddressModule } from 'src/address/address.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]),
    AddressModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CollectionService, StripeService],
})
export class ProductModule {}
