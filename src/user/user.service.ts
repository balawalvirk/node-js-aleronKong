import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/base.service';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserService extends BaseService {
  constructor(@InjectModel(User.name) private userModal: Model<UserDocument>) {
    super(userModal);
  }
}
