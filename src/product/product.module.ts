import { forwardRef, Module } from '@nestjs/common';
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
import { Sale, SaleSchema } from './sale.schema';
import { SaleService } from './sale.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: ProductCategory.name, schema: ProductCategorySchema }]),
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    ReviewModule,
    AddressModule,
    OrderModule,
    forwardRef(() => UsersModule),
    NotificationModule,
    FirebaseModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, StripeService, ProductCategoryService, CartService, SaleService],
  exports: [ProductService, CartService, SaleService],
})
export class ProductModule {}
