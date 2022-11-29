import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { ChangePasswordDto } from 'src/auth/dtos/change-pass.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserRole, UserStatus } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { CreateBankAccountDto } from './dtos/create-bank-account.dto';
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

  @Roles(UserRole.ADMIN)
  @Get('find-all')
  async findAll() {
    return await this.usersService.findAllRecords();
  }

  @Roles(UserRole.ADMIN)
  @Put(':id/block')
  async blockUser(@Param('id', ParseObjectId) id: string) {
    const user = await this.usersService.findOneRecordAndUpdate(
      { _id: id },
      { status: UserStatus.BLOCKED }
    );
    if (!user) throw new HttpException('User does not exists', HttpStatus.BAD_REQUEST);
    return { message: 'User blocked successfully.' };
  }

  @Post('change-password')
  async changePassword(@Body() { newPassword }: ChangePasswordDto, @GetUser() user: UserDocument) {
    await this.usersService.findOneRecordAndUpdate(
      { _id: user._id },
      { password: await hash(newPassword, 10) }
    );
    return { message: 'Password changed successfully.' };
  }

  @Post('bank-account/create')
  async createBankAccount(
    @GetUser() user: UserDocument,
    @Body() { accountHolderName, accountNumber, routingNumber }: CreateBankAccountDto
  ) {
    return await this.stripeService.createBankAccount(user.accountId, {
      // @ts-ignore
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: 'individual',
        routing_number: routingNumber,
        account_number: accountNumber,
      },
    });
  }

  @Get('bank-account/find-all')
  async findAllBankAccounts(@GetUser() user: UserDocument) {
    return await this.stripeService.findAllBankAccounts(user.accountId, { object: 'bank_account' });
  }

  @Delete('bank-account/:bankAccount/delete')
  async deleteBankAccount(
    @GetUser() user: UserDocument,
    @Param('bankAccount') bankAccount: string
  ) {
    return await this.stripeService.deleteBankAccount(user.accountId, bankAccount);
  }

  @Put('bank-account/:bankAccount/update')
  async updateBankAccount(
    @Param('bankAccount') bankAccount: string,
    @GetUser() user: UserDocument
  ) {
    return await this.stripeService.updateBankAccount(user.accountId, bankAccount);
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
