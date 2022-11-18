import { Body, Controller, Put, UseGuards } from '@nestjs/common';
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
