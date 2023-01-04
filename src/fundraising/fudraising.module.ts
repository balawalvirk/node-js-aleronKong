import { Module } from '@nestjs/common';
import { FudraisingController } from './fudraising.controller';
import { PostsModule } from 'src/posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FundraisingCategory, FundraisingCategorySchema } from './category.schema';
import { FundraisingSubcategory, FundraisingSubcategorySchema } from './subCategory.schema';
import { FudraisingCategoryService } from './category.service';
import { FudraisingSubCategoryService } from './subcategory.service';
import { Fundraising, FundraisingSchema } from './fundraising.schema';
import { FudraisingService } from './fundraising.service';
import { StripeService } from 'src/helpers';
import { SaleModule } from 'src/sale/sale.module';

@Module({
  imports: [
    PostsModule,
    SaleModule,
    MongooseModule.forFeature([{ name: FundraisingCategory.name, schema: FundraisingCategorySchema }]),
    MongooseModule.forFeature([{ name: FundraisingSubcategory.name, schema: FundraisingSubcategorySchema }]),
    MongooseModule.forFeature([{ name: Fundraising.name, schema: FundraisingSchema }]),
  ],
  controllers: [FudraisingController],
  providers: [FudraisingCategoryService, FudraisingSubCategoryService, FudraisingService, StripeService],
})
export class FudraisingModule {}
