import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Collection, Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { CollectionDocument } from './collection.schema';

@Injectable()
export class CollectionService extends BaseService {
  constructor(@InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>) {
    super(collectionModel);
  }
}
