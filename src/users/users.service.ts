import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class UsersService extends BaseService {
  constructor(@InjectModel(User.name) private userModal: Model<UserDocument>) {
    super(userModal);
  }

  async findOne(query: FilterQuery<UserDocument>) {
    return await this.userModal
      .findOne(query)
      .populate([
        { path: 'defaultAddress' },
        { path: 'supportingPackages', select: 'creator' },
        { path: 'supportingGuildPackages' },
      ])
      .lean();
  }
}
