import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { FundDocument } from './fund.schema';
export declare class FundService extends BaseService<FundDocument> {
    private readonly FundModel;
    constructor(FundModel: Model<FundDocument>);
}
