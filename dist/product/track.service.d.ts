import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { TrackDocument } from './tracking.schema';
export declare class TrackService extends BaseService<TrackDocument> {
    private trackModel;
    constructor(trackModel: Model<TrackDocument>);
}
