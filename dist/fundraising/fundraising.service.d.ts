import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { FundraisingDocument } from './fundraising.schema';
export declare class FundraisingService extends BaseService<FundraisingDocument> {
    private readonly FundraisingModel;
    constructor(FundraisingModel: Model<FundraisingDocument>);
}
