import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { User, UserDocument } from 'src/users/users.schema';
import { UpdateUserDto } from './dtos/update-user';
import { UsersService } from './users.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private usersService: UsersService) {}

  @Put('update')
  async setupProfile(@Body() body: UpdateUserDto, @GetUser() user: UserDocument): Promise<User> {
    return await this.usersService.findOneAndUpdate({ _id: user._id }, body);
  }
}
