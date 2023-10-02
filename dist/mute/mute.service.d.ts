import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { MuteDocument } from './mute.schema';
export declare class MuteService extends BaseService<MuteDocument> {
    private muteModel;
    constructor(muteModel: Model<MuteDocument>);
}
