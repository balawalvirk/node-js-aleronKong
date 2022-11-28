import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { ChangePasswordDto } from 'src/auth/dtos/change-pass.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { UpdateUserDto } from './dtos/update-user';
import { UsersService } from './users.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService
  ) {}

  @Put('update')
  async setupProfile(@Body() body: UpdateUserDto, @GetUser() user: UserDocument) {
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, body);
  }

  @Get('find-one')
  async findOne(@GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id });
    if (!userFound) throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    return userFound;
  }

  @Post('change-password')
  async changePassword(@Body() { newPassword }: ChangePasswordDto, @GetUser() user: UserDocument) {
    await this.usersService.findOneRecordAndUpdate(
      { _id: user._id },
      { password: await hash(newPassword, 10) }
    );
    return { message: 'Password changed successfully.' };
  }

  //become a guild member
  @Put('guild-member/create')
  async createGuildMember(@GetUser() user: UserDocument) {
    /**
     * TODO need to change this dynamically.
     */
    const productId: string = 'prod_MkvBc9VwxnmWAd';
    const priceId: string = 'price_1M1PKmLyEqAWCXHoxHWq7yYw';

    await this.stripeService.createSubscription({
      customer: user.customerId,
      items: [{ price: priceId }],
      currency: 'usd',
    });

    return await this.usersService.findOneRecordAndUpdate(
      { _id: user._id },
      { isGuildMember: true }
    );
  }
}
