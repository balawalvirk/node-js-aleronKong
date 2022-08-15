import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/decorators/user.decorator';
import { User, UserDocument } from 'src/schemas/user.schema';
import { SetupProfileDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    @InjectModel(User.name) private readonly userModal: Model<UserDocument>,
    private userService: UserService
  ) {}

  @Put('setup-profile')
  async setupProfile(@Body() body: SetupProfileDto, @GetUser() user: UserDocument): Promise<User> {
    return await this.userService.findOneAndUpdate({ _id: user._id }, body);
  }
}
