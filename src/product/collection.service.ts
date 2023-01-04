import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Collection, CollectionDocument } from './collection.schema';

@Injectable()
export class CollectionService extends BaseService<CollectionDocument> {
  constructor(@InjectModel(Collection.name) private CollectionModel: Model<CollectionDocument>) {
    super(CollectionModel);
  }

  async findAllCollections(query: FilterQuery<any>) {
    return await this.CollectionModel.find(query).populate('products');
  }
}
