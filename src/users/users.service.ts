import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/base.service';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class UsersService extends BaseService {
  constructor(@InjectModel(User.name) private userModal: Model<UserDocument>) {
    super(userModal);
  }
}
