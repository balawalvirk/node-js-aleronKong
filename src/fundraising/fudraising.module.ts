import { forwardRef, Module } from '@nestjs/common';
import { FundraisingController } from './fudraising.controller';
import { PostsModule } from 'src/posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FundraisingCategory, FundraisingCategorySchema } from './category.schema';
import { FundraisingSubcategory, FundraisingSubcategorySchema } from './subCategory.schema';
import { FudraisingCategoryService } from './category.service';
import { FudraisingSubCategoryService } from './subcategory.service';
import { Fundraising, FundraisingSchema } from './fundraising.schema';
import { FundraisingService } from './fundraising.service';
import { StripeService } from 'src/helpers';
import { Fund, FundSchema } from './fund.schema';
import { FundService } from './fund.service';
import { NotificationModule } from 'src/notification/notification.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    forwardRef(() => PostsModule),
    MongooseModule.forFeature([{ name: FundraisingCategory.name, schema: FundraisingCategorySchema }]),
    MongooseModule.forFeature([{ name: FundraisingSubcategory.name, schema: FundraisingSubcategorySchema }]),
    MongooseModule.forFeature([{ name: Fundraising.name, schema: FundraisingSchema }]),
    MongooseModule.forFeature([{ name: Fund.name, schema: FundSchema }]),
    NotificationModule,
    FirebaseModule,
  ],
  controllers: [FundraisingController],
  providers: [FudraisingCategoryService, FudraisingSubCategoryService, FundraisingService, StripeService, FundService],
  exports: [FundraisingService, FundService],
})
export class FundraisingModule {}
