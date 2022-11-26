import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { AddressDocument } from './address.schema';
export declare class AddressService extends BaseService {
    private addressModel;
    constructor(addressModel: Model<AddressDocument>);
}
