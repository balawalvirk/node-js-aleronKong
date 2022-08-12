import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(@InjectModel(User.name) private readonly userModal: Model<UserDocument>) {}

  @Get('/find-all')
  findAll(): string {
    return 'all users';
  }
}
