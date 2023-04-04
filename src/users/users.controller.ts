import { Body, Controller, ValidationPipe, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, Ip, BadRequestException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ChangePasswordDto } from 'src/auth/dtos/change-pass.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { MessageService } from 'src/chat/message.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { makeQuery, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType, SellerRequest, UserRoles, UserStatus } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { ApproveRejectSellerDto } from './dtos/approve-reject-seller.dto';
import { CreateBankAccountDto } from './dtos/create-bank-account.dto';
import { CreatePayoutDto } from './dtos/create-payout.dto';
import { CreateSellerDto } from './dtos/create-seller.dto';
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
      if (user._id == id) throw new BadRequestException('You cannot block yourself.');
      const userFound = await this.usersService.findOneRecord({ _id: user._id, blockedUsers: { $in: [id] } });
      if (userFound) throw new BadRequestException('You already blocked this user.');
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
    if (!match) throw new BadRequestException('Invalid old password.');
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
    if (userFound) throw new BadRequestException('User is already your friend.');
    const friend = await this.usersService.findOneRecord({ _id: id });
    const updatedUser = await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { friends: id } });
    await this.notificationService.createRecord({
      user: id,
      message: 'started following you.',
      type: NotificationType.USER_FOLLOWING,
      sender: user._id,
      receiver: id,
    });
    if (friend.fcmToken) {
      await this.firebaseService.sendNotification({
        token: friend.fcmToken,
        notification: { title: 'started following you.' },
        data: { user: id, type: NotificationType.USER_FOLLOWING },
      });
    }
    return updatedUser;
  }

  @Put('friend/:id/remove')
  async removeFriend(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    //@ts-ignore
    const isFriend = user.friends.find((friend) => friend == id);
    if (!isFriend) throw new BadRequestException('User is not your friend.');
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { friends: id } });
  }

  @Get('friend/find-all')
  async findAllFriends(@GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id }).populate('friends');
    return userFound.friends;
  }

  // find count of unread messages and unread notifications
  @Get('home')
  async home(@GetUser() user: UserDocument) {
    const messages = await this.messageService.countRecords({ receiver: user._id, isRead: false });
    const notifications = await this.notificationService.countRecords({ receiver: user._id, isRead: false });
    return { messages, notifications };
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

  //api to create a seller request to admin
  @Put('seller/create')
  async createSeller(@Body() createSellerDto: CreateSellerDto, @GetUser() user: UserDocument, @Ip() ip: string) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id });
    if (!userFound) throw new BadRequestException('User does not exists.');
    if (userFound.sellerRequest === SellerRequest.PENDING) throw new BadRequestException('Your seller request is already under consideration.');

    const { city, line1, ssnLast4, state, postalCode, phoneNumber } = createSellerDto;
    const { email, firstName, lastName, birthDate } = userFound;
    const dob = new Date(birthDate);

    // create stripe connect account
    await this.stripeService.createAccount({
      email: email,
      type: 'custom',
      business_type: 'individual',
      business_profile: {
        mcc: '5734',
        product_description: 'aleron kong product description',
      },
      tos_acceptance: { date: Math.floor(Date.now() / 1000), ip },
      country: 'US',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        ssn_last_4: ssnLast4,
        phone: phoneNumber,
        dob: {
          year: dob.getFullYear(),
          day: dob.getDate(),
          month: dob.getMonth() + 1,
        },
        address: {
          city,
          line1: line1,
          postal_code: postalCode,
          state,
        },
      },

      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });

    await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { ip, sellerRequest: SellerRequest.PENDING, ...createSellerDto });

    const admin = await this.usersService.findOneRecord({ role: { $in: [UserRoles.ADMIN] } });
    await this.notificationService.createRecord({
      type: NotificationType.SELLER_REQUEST,
      message: 'A new request for seller approval.',
      sender: user._id,
      user: user._id,
      receiver: admin._id,
    });
    if (admin.fcmToken) {
      await this.firebaseService.sendNotification({
        token: admin.fcmToken,
        notification: { title: 'A new request for seller approval.' },
        data: { user: user._id, type: NotificationType.SELLER_REQUEST },
      });
    }
    return 'Your request for seller is under consideration.';
  }

  @Roles(UserRoles.ADMIN)
  @Put('seller/approve-reject')
  async approveRejectSeller(@Body() approveRejectSellerDto: ApproveRejectSellerDto) {
    const user = await this.usersService.findOneRecordAndUpdate(
      { _id: approveRejectSellerDto.user },
      { sellerRequest: approveRejectSellerDto.sellerRequest }
    );

    if (user.sellerRequest === SellerRequest.APPROVED) {
      // await this.usersService.createSellerAccount(user);
      await this.usersService.findOneRecordAndUpdate({ _id: user }, { $push: { role: UserRoles.SELLER } });
    }

    await this.notificationService.createRecord({
      type: NotificationType.SELLER_REQUEST_APPROVED_REJECTED,
      message: `Your seller request has been ${user.sellerRequest}`,
      receiver: user._id,
    });

    if (user.fcmToken) {
      await this.firebaseService.sendNotification({
        token: user.fcmToken,
        notification: { title: `Your seller request has been ${user.sellerRequest}` },
        data: { user: user._id, type: NotificationType.SELLER_REQUEST_APPROVED_REJECTED },
      });
    }

    return 'Request approved successfully.';
  }

  // api to find all seller request
  @Roles(UserRoles.ADMIN)
  @Get('seller/find-all')
  async findAllSellerRequests() {
    return await this.usersService.findAllRecords({ sellerRequest: SellerRequest.PENDING });
  }

  @Get('seller/check-status')
  async checkSellerStatus(@GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id });
    return { sellerRequest: userFound.sellerRequest };
  }

  @Get('earnings')
  async findEarnings(@GetUser() user: UserDocument) {
    const balance = await this.stripeService.findConnectedAccountBalance(user.sellerId);
    const transfers = await this.stripeService.findAllTransfers({ limit: 20, destination: user.sellerId });
    return { balance, transfers };
  }
}
