import {
  Body,
  Controller,
  ValidationPipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ChangePasswordDto } from 'src/auth/dtos/change-pass.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { MessageService } from 'src/chat/message.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { makeQuery, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType, UserRoles, UserStatus } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { CreateBankAccountDto } from './dtos/create-bank-account.dto';
import { CreatePayoutDto } from './dtos/create-payout.dto';
import { FindAllUsersQueryDto } from './dtos/find-all-users.query.dto';
import { UpdateBankAccountDto } from './dtos/update-bank-account.dto';
import { UpdateUserDto } from './dtos/update-user';
import { UsersService } from './users.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService,
    private readonly messageService: MessageService
  ) {}

  @Put('update')
  async setupProfile(@Body() body: UpdateUserDto, @GetUser() user: UserDocument) {
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, body);
  }

  @Get('find-one/:id')
  async findOne(@Param('id', ParseObjectId) id: string) {
    return await this.usersService.findOneRecord({ _id: id });
  }

  @Roles(UserRoles.ADMIN)
  @Get('find-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() { page, limit, query, role }: FindAllUsersQueryDto) {
    const $q = makeQuery({ page, limit });
    const rjx = { $regex: query, $options: 'i' };
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const condition = {
      role: { $nin: [UserRoles.ADMIN], $in: [role] },
      $or: [{ firstName: rjx }, { lastName: rjx }, { email: rjx }, { userName: rjx }],
    };
    const total = await this.usersService.countRecords(condition);
    const users = await this.usersService.findAllRecords(condition, options);
    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: users,
    };
    return paginated;
  }

  @Put(':id/block')
  async blockUser(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    // if admin is doing this request then permanently block this user.
    if (user.role.includes(UserRoles.ADMIN)) {
      await this.usersService.findOneRecordAndUpdate({ _id: id }, { status: UserStatus.BLOCKED });
      return { message: 'User blocked successfully.' };
    } else {
      if (user._id == id) throw new HttpException('You cannot block yourself.', HttpStatus.BAD_REQUEST);
      const userFound = await this.usersService.findOneRecord({ _id: user._id, blockedUsers: { $in: [id] } });
      if (userFound) throw new HttpException('You already blocked this user.', HttpStatus.BAD_REQUEST);
      return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { blockedUsers: id } });
    }
  }

  @Put(':id/unblock')
  async unBlock(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    // if admin is doing this request then un block this user.
    if (user.role.includes(UserRoles.ADMIN)) {
      await this.usersService.findOneRecordAndUpdate({ _id: id }, { status: UserStatus.ACTIVE });
      return { message: 'User unblocked successfully.' };
    } else {
      return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { blockedUsers: id } });
    }
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
  async createBankAccount(@GetUser() user: UserDocument, @Body() { accountHolderName, accountNumber, routingNumber }: CreateBankAccountDto) {
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
    await this.stripeService.updateAccount(user.sellerId, { settings: { payouts: { schedule: { interval: 'manual' } } } });
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

  @Post('payout/create')
  async createPayout(@Body() { amount }: CreatePayoutDto) {
    await this.stripeService.createPayout({ currency: 'usd', amount: amount * 100 });
    return { message: 'Amount withdraw successfully.' };
  }

  //----------------------------------------------friends api-----------------------------------
  @Put('friend/:id/create')
  async addFriend(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id, friends: { $in: [id] } });
    if (userFound) throw new HttpException('User is already your friend.', HttpStatus.BAD_REQUEST);
    const friend = await this.usersService.findOneRecord({ _id: id });
    const updatedUser = await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { friends: id } });
    await this.notificationService.createRecord({
      user: id,
      message: 'is following you.',
      type: NotificationType.USER_FOLLOWING,
      sender: user._id,
      receiver: id,
    });
    if (friend.fcmToken) {
      await this.firebaseService.sendNotification({
        token: friend.fcmToken,
        notification: { title: 'is following you.' },
        data: { user: id, type: NotificationType.USER_FOLLOWING },
      });
    }
    return updatedUser;
  }

  @Put('friend/:id/remove')
  async removeFriend(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    //@ts-ignore
    const isFriend = user.friends.find((friend) => friend == id);
    if (!isFriend) throw new HttpException('User is not your friend.', HttpStatus.BAD_REQUEST);
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { friends: id } });
  }

  //get count of unread messages
  @Get('unread-messages')
  async findUnreadMessages(@GetUser() user: UserDocument) {
    const messages = await this.messageService.countRecords({ receiver: user._id, isRead: false });
    return { messages };
  }

  //get count of unread notifications
  @Get('unread-notifications')
  async findUnreadNotifications(@GetUser() user: UserDocument) {
    const notifications = await this.notificationService.countRecords({ receiver: user._id, isRead: false });
    return { notifications };
  }
}
