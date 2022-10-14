import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection } from 'mongoose';
import { CollectionSchema } from './collection.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }])],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}
