import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { StripeService } from 'src/helpers';
import { BaseService } from 'src/helpers/services/base.service';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) private userModal: Model<UserDocument>, private readonly stripeService: StripeService) {
    super(userModal);
  }

  async findOne(query: FilterQuery<UserDocument>) {
    return await this.userModal
      .findOne(query)
      .populate([{ path: 'defaultAddress' }, { path: 'supportingPackages' }])
      .lean();
  }

  async createCustomerAccount(email: string, name: string) {
    return await this.stripeService.createCustomer({ email, name });
  }

  async searchQuery() {
    return await this.userModal.find({
      $expr: {
        $regexMatch: {
          input: {
            $concat: ['$firstName', ' ', '$lastName'],
          },
          regex: 'awais',
          options: 'i',
        },
      },
    });
  }
}
