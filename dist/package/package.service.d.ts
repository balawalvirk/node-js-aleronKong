import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Package, PackageDocument } from './package.schema';
export declare class PackageService extends BaseService {
    private PackageModel;
    constructor(PackageModel: Model<PackageDocument>);
    findAllAuthors(userId: string): Promise<Omit<Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
}
