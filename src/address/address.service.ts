import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Address, AddressDocument } from './address.schema';

@Injectable()
export class AddressService extends BaseService {
  constructor(@InjectModel(Address.name) private addressModel: Model<AddressDocument>) {
    super(addressModel);
  }
}
