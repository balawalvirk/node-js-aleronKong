import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
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

  async createSellerAccount(user: LeanDocument<UserDocument>) {
    const dob = new Date(user.birthDate);
    const { city, line1, email, phoneNumber, ssnLast4, firstName, lastName, state, postalCode, ip } = user;
    return await this.stripeService.createAccount({
      email: email,
      type: 'custom',
      business_type: 'individual',
      business_profile: {
        mcc: '5734',
        product_description: 'aleron kong product description',
      },
      tos_acceptance: { date: Math.floor(Date.now() / 1000), ip },
      country: 'US',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        ssn_last_4: ssnLast4,
        phone: phoneNumber,
        dob: {
          year: dob.getFullYear(),
          day: dob.getDate(),
          month: dob.getMonth() + 1,
        },
        address: {
          city,
          line1: line1,
          postal_code: postalCode,
          state,
        },
      },

      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });
  }
}
