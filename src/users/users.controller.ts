import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ChangePasswordDto } from 'src/auth/dtos/change-pass.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { makeQuery, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserRole, UserStatus } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { CreateBankAccountDto } from './dtos/create-bank-account.dto';
import { UpdateBankAccountDto } from './dtos/update-bank-account.dto';
import { UpdateUserDto } from './dtos/update-user';
import { UsersService } from './users.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly usersService: UsersService, private readonly stripeService: StripeService) {}

  @Put('update')
  async setupProfile(@Body() body: UpdateUserDto, @GetUser() user: UserDocument) {
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, body);
  }

  @Get('find-one/:id')
  async findOne(@Param('id', ParseObjectId) id: string) {
    return await this.usersService.findOneRecord({ _id: id });
  }

  @Roles(UserRole.ADMIN)
  @Get('find-all')
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('query', new DefaultValuePipe('')) query: string
  ) {
    const $q = makeQuery({ page, limit });
    const rjx = { $regex: query, $options: 'i' };
    const options = { limit: $q.limit, skip: $q.skip };
    const total = await this.usersService.countRecords({});
    const users = await this.usersService.paginate(
      {
        role: { $nin: [UserRole.ADMIN] },
        $or: [{ firstName: rjx }, { lastName: rjx }, { email: rjx }],
      },
      options
    );

    const paginated = {
      total: total,
      pages: Math.round(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: users,
    };
    return paginated;
  }

  @Put(':id/block')
  async blockUser(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    // if admin is doing this request then permanently block this user.
    if (user.role.includes(UserRole.ADMIN)) {
      await this.usersService.findOneRecordAndUpdate({ _id: id }, { status: UserStatus.BLOCKED });
    } else {
      const userFound = await this.usersService.findOneRecord({
        _id: user._id,
        blockedUsers: { $in: [id] },
      });
      if (userFound) throw new HttpException('You already blocked this user.', HttpStatus.BAD_REQUEST);
      await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { blockedUsers: id } });
    }
    return { message: 'User blocked successfully.' };
  }

  @Put(':id/unblock')
  async unBlock(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { blockedUsers: id } });
    return { message: 'User unblocked successfully.' };
  }

  @Post('change-password')
  async changePassword(@Body() { newPassword, oldPassword }: ChangePasswordDto, @GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id });
    const match = await compare(oldPassword, userFound.password);
    if (!match) throw new HttpException('Invalid old password.', HttpStatus.BAD_REQUEST);
    await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { password: await hash(newPassword, 10) });
    return { message: 'Password changed successfully.' };
  }

  // ------------------------------------------------------------bank account apis---------------------------------------
  // all bank accounts used to withdraw funds
  @Post('bank-account/create')
  async createBankAccount(
    @GetUser() user: UserDocument,
    @Body() { accountHolderName, accountNumber, routingNumber }: CreateBankAccountDto
  ) {
    const bankAccount = await this.stripeService.createBankAccount(user.sellerId, {
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
    if (!user.defaultWithDrawAccountId) {
      await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { defaultWithDrawAccountId: bankAccount.id });
    }
    return bankAccount;
  }

  @Get('bank-account/find-all')
  async findAllBankAccounts(@GetUser() user: UserDocument) {
    const bankAccounts = await this.stripeService.findAllBankAccounts(user.sellerId, { object: 'bank_account' });
    return bankAccounts.data;
  }

  @Delete('bank-account/:bankAccount/delete')
  async deleteBankAccount(@GetUser() user: UserDocument, @Param('bankAccount') bankAccount: string) {
    await this.stripeService.deleteBankAccount(user.sellerId, bankAccount);
    return { message: 'Account deleted successfully.' };
  }

  @Put('bank-account/:bankAccount/update')
  async updateBankAccount(
    @Param('bankAccount') bankAccount: string,
    @GetUser() user: UserDocument,
    @Body() { accountHolderName }: UpdateBankAccountDto
  ) {
    return await this.stripeService.updateBankAccount(user.sellerId, bankAccount, {
      account_holder_name: accountHolderName,
    });
  }

  @Put('friend/:id/create')
  async addFriend(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const friend = await this.usersService.findOneRecord({ _id: user._id, friends: { $in: [id] } });
    if (friend) throw new HttpException('User is already your friend.', HttpStatus.BAD_REQUEST);
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { friends: id } });
  }
}
