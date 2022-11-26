import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Collection, CollectionDocument } from './collection.schema';
export declare class CollectionService extends BaseService {
    private CollectionModel;
    constructor(CollectionModel: Model<CollectionDocument>);
    findAllCollections(query: FilterQuery<any>): Promise<Omit<Collection & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
}
