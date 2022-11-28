import { Module } from '@nestjs/common';
import { FudraisingService } from './fudraising.service';
import { FudraisingController } from './fudraising.controller';
import { PostsModule } from 'src/posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FundraisingCategory, FundraisingCategorySchema } from './category.schema';
import { FundraisingSubcategory, FundraisingSubcategorySchema } from './subCategory.schema';

@Module({
  imports: [
    PostsModule,
    MongooseModule.forFeature([
      { name: FundraisingCategory.name, schema: FundraisingCategorySchema },
    ]),
    MongooseModule.forFeature([
      { name: FundraisingSubcategory.name, schema: FundraisingSubcategorySchema },
    ]),
  ],
  controllers: [FudraisingController],
  providers: [FudraisingService],
})
export class FudraisingModule {}
