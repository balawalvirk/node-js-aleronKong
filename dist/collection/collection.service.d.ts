import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { CollectionDocument } from './collection.schema';
export declare class CollectionService extends BaseService {
    private collectionModel;
    constructor(collectionModel: Model<CollectionDocument>);
}
