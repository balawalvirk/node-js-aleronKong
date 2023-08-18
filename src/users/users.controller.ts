import {
  Body,
  Controller,
  ValidationPipe,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  Ip,
  BadRequestException,
  ParseBoolPipe,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ChangePasswordDto } from 'src/auth/dtos/change-pass.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { MessageService } from 'src/chat/message.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { GroupService } from 'src/group/group.service';
import { makeQuery, PaginationDto, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { NotificationService } from 'src/notification/notification.service';
import { CartService } from 'src/product/cart.service';
import { NotificationType, SellerRequest, TransectionDuration, UserRoles, UserStatus } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { ApproveRejectSellerDto } from './dtos/approve-reject-seller.dto';
import { CompleteProfileDto } from './dtos/complete-profile.dto';
import { CreateBankAccountDto } from './dtos/create-bank-account.dto';
import { CreatePayoutDto } from './dtos/create-payout.dto';
import { CreateSellerDto } from './dtos/create-seller.dto';
import { FindAllFriendRequestsQueryDto } from './dtos/find-all-friend-requests.query.dto';
import { FindAllUsersQueryDto } from './dtos/find-all-users.query.dto';
import { FindTransectionsQueryDto } from './dtos/find-transections.query.dto';
import { UpdateBankAccountDto } from './dtos/update-bank-account.dto';
import { UpdateUserDto } from './dtos/update-user';
import { FriendRequestService } from './friend-request.service';
import { UsersService } from './users.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService,
    private readonly messageService: MessageService,
    private readonly cartService: CartService,
    private readonly friendRequestService: FriendRequestService,
    private readonly groupService: GroupService
  ) {}

  @Put('update')
  async setupProfile(@Body() updateUserDto: UpdateUserDto, @GetUser() user: UserDocument) {
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, updateUserDto);
  }

  @Put('/complete-profile')
  async completeProfile(@Body() completeProfileDto: CompleteProfileDto, @GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id });
    if (!userFound) throw new BadRequestException('User does not exists.');
    const customer = await this.usersService.createCustomerAccount(userFound.email, `${completeProfileDto.firstName} ${completeProfileDto.lastName}`);
    return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { ...completeProfileDto, customerId: customer.id });
  }

  @Get('find-one/:id')
  async findOne(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: id });
    const friendRequest = await this.friendRequestService.findOneRecord({ sender: user._id, receiver: id });
    if (friendRequest) return { ...userFound.toJSON(), friendRequest };
    else return userFound;
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
    if (!user.defaultWithDrawAccountId) {
      await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { defaultWithDrawAccountId: bankAccount.id });
    }
    return bankAccount;
  }

  // api to find all bank accounts
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
    @Body() updateBankAccountDto: UpdateBankAccountDto
  ) {
    const account = await this.stripeService.updateBankAccount(user.sellerId, bankAccount, updateBankAccountDto);
    if (updateBankAccountDto.default_for_currency)
      await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { defaultWithDrawAccountId: account.id });
    return account;
  }

  @Post('payout/create')
  async createPayout(@Body() { amount }: CreatePayoutDto, @GetUser() user: UserDocument) {
    await this.stripeService.createConnectedAccountPayout({ currency: 'usd', amount: amount * 100 }, { stripeAccount: user.sellerId });
    return { message: 'Amount withdraw successfully.' };
  }

  //----------------------------------------------friends api-----------------------------------

  @Put('friend/:id/create')
  async addFriend(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    if (user._id == id) throw new BadRequestException('You cannot add yourself as a friend.');
    const userFound = await this.usersService.findOneRecord({ _id: user._id, friends: { $in: [id] } });
    if (userFound) throw new BadRequestException('User is already your friend.');
    const friend = await this.usersService.findOneRecord({ _id: id });
    const updatedUser = await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { friends: id } });
    await this.notificationService.createRecord({
      user: user._id,
      message: 'started following you.',
      type: NotificationType.USER_FOLLOWING,
      sender: user._id,
      receiver: id,
    });
    if (friend.fcmToken) {
      await this.firebaseService.sendNotification({
        token: friend.fcmToken,
        notification: { title: `${user.firstName} ${user.lastName} started following you.` },
        data: { user: user._id.toString(), type: NotificationType.USER_FOLLOWING },
      });
    }
    return updatedUser;
  }

  @Put('friend/:id/remove')
  async removeFriend(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    //@ts-ignore
    const isFriend = user.friends.find((friend) => friend.equals(id));
    if (!isFriend) throw new BadRequestException('User is not your friend.');
    await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { friends: id } });
    return await this.usersService.findOneRecordAndUpdate({ _id: id }, { $pull: { friends: user._id } });
  }

  @Get('friend/find-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllFriends(@GetUser() user: UserDocument, @Query() paginationDto: PaginationDto) {
    const condition = { _id: { $in: user.friends } };
    if (paginationDto) {
      const $q = makeQuery({ page: paginationDto.page, limit: paginationDto.limit });
      const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
      const friends = await this.usersService.findAllRecords(condition, options);
      const total = await this.usersService.countRecords(condition);
      const paginated = {
        total,
        pages: Math.round(total / $q.limit),
        page: $q.page,
        limit: $q.limit,
        data: friends,
      };
      return paginated;
    } else {
      return await this.usersService.findAllRecords(condition);
    }
  }

  @Get('suggested-friends/find-all')
  async findAllSuggestedFriends(@GetUser() user: UserDocument, @Query() { limit, page }: PaginationDto) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id }).populate({ path: 'friends' });
    const suggestedFriends = userFound.friends.map((friend) => friend.friends).flat(Infinity);
    const groups = await this.groupService.findAllRecords({ 'members.member': user._id });
    const groupMembers = groups
      .map((group) => group.members)
      .flat(Infinity)
      //@ts-ignore
      .map((member) => member.member);
    const allUsers = [...suggestedFriends, ...groupMembers].filter((usr) => !usr.equals(user._id));

    const $q = makeQuery({ page, limit });
    const condition = { _id: { $in: allUsers } };
    const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
    const friends = await this.usersService.findAllRecords(condition, options);
    const total = await this.usersService.countRecords(condition);
    const paginated = {
      total,
      pages: Math.round(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: friends,
    };
    return paginated;
  }

  // find count of unread messages and unread notifications
  @Get('home')
  async home(@GetUser() user: UserDocument) {
    const messages = await this.messageService.countRecords({ receiver: user._id, isRead: false });
    const notifications = await this.notificationService.countRecords({ receiver: user._id, isRead: false });
    const cart = await this.cartService.findOneRecord({ creator: user._id });
    return { messages, notifications, cartItems: cart?.items?.length || 0 };
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
    const seller = await this.stripeService.createAccount({
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

    await this.usersService.findOneRecordAndUpdate(
      { _id: user._id },
      { ip, sellerRequest: SellerRequest.PENDING, sellerId: seller.id, ...createSellerDto }
    );

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
  async approveRejectSeller(@Body() { sellerRequest, user }: ApproveRejectSellerDto) {
    const userFound = await this.usersService.findOneRecord({ _id: user });
    if (!userFound) throw new BadRequestException('User does not exists.');

    if (sellerRequest === SellerRequest.APPROVED) {
      // seller reequest is approved make capabilites enabled
      await this.stripeService.updateAccount(userFound.sellerId, {
        settings: {
          payouts: {
            schedule: {
              // ealrier interval was manual
              // interval:"manual"
              interval: 'daily',
              delay_days: 16,
            },
          },
        },
      });
      await this.usersService.findOneRecordAndUpdate(
        { _id: userFound._id },
        { role: [UserRoles.SELLER, UserRoles.CUSTOMER], sellerRequest: SellerRequest.APPROVED }
      );
    } else if (sellerRequest === SellerRequest.REJECTED) {
      // seller request is rejected delete account
      await this.stripeService.deleteAccount(userFound.sellerId);
      await this.usersService.findOneRecordAndUpdate({ _id: user }, { sellerRequest: SellerRequest.REJECTED, $unset: { sellerId: 1 } });
    }

    await this.notificationService.createRecord({
      type: NotificationType.SELLER_REQUEST_APPROVED_REJECTED,
      message: `Your seller request has been ${sellerRequest}`,
      receiver: userFound._id,
    });

    if (userFound.fcmToken) {
      await this.firebaseService.sendNotification({
        token: userFound.fcmToken,
        notification: { title: `Your seller request has been ${sellerRequest}` },
        data: { user: userFound._id, type: NotificationType.SELLER_REQUEST_APPROVED_REJECTED },
      });
    }

    return 'Request approved successfully.';
  }

  // api to find all seller request
  @Roles(UserRoles.ADMIN)
  @Get('seller/find-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllSellerRequests(@Query() { page, limit, query }: PaginationDto) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const condition = {
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: query,
              options: 'i',
            },
          },
        },
      ],
      sellerRequest: SellerRequest.PENDING,
    };
    const users = await this.usersService.findAllRecords(condition, options);
    const total = await this.usersService.countRecords(condition);

    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: users,
    };

    return paginated;
  }

  @Get('seller/check-status')
  async checkSellerStatus(@GetUser() user: UserDocument) {
    const userFound = await this.usersService.findOneRecord({ _id: user._id });
    return { sellerRequest: userFound.sellerRequest };
  }

  @Get('earnings')
  async findEarnings(@GetUser() user: UserDocument) {
    let totalVolume = 0;
    let transfers = await this.stripeService.findAllTransfers({ limit: 100, destination: user.sellerId });
    totalVolume += transfers.data.reduce((n, { amount }) => amount + n, 0);
    while (transfers.has_more) {
      transfers = await this.stripeService.findAllTransfers({
        limit: 100,
        destination: user.sellerId,
        starting_after: transfers.data[transfers.data.length - 1].id,
      });
      totalVolume += transfers.data.reduce((n, { amount }) => amount + n, 0);
    }
    const balance = await this.stripeService.findConnectedAccountBalance(user.sellerId);
    return { ...balance, totalVolume };
  }

  @Get('/seller/transection/find-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllTransections(@GetUser() user: UserDocument, @Query() { limit, lastRecord, duration }: FindTransectionsQueryDto) {
    const date = new Date();
    let startDate: number;
    if (duration === TransectionDuration.WEEK) startDate = Math.floor(new Date(date.setDate(date.getDate() - date.getDay())).getTime() / 1000);
    else if (duration === TransectionDuration.MONTH) startDate = Math.floor(new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000);
    else if (duration === TransectionDuration.YEAR) startDate = Math.floor(new Date(date.getFullYear(), 0, 1).getTime() / 1000);
    const transfers = await this.stripeService.findAllTransfers({
      limit: limit,
      destination: user.sellerId,
      starting_after: lastRecord,
      created: { gt: startDate },
    });
    return transfers.data;
  }

  // *************************************************************************friend request apis***************************************************
  @Post('friend-request/create')
  async createFriendRequest(@GetUser() user: UserDocument, @Body('receiver', ParseObjectId) receiver: string) {
    const friendRequestExists = await this.friendRequestService.findOneRecord({ receiver, sender: user._id });
    if (friendRequestExists) throw new BadRequestException('Friend request for this user exists already.');
    const friendRequest = await this.friendRequestService.create({ receiver, sender: user._id });

    await this.notificationService.createRecord({
      sender: user._id,
      receiver: receiver,
      user: user._id,
      message: 'sent you a friend request.',
      type: NotificationType.FRIEND_REQUEST,
    });

    await this.firebaseService.sendNotification({
      token: friendRequest.receiver.fcmToken,
      notification: { title: `${user.firstName} ${user.lastName} sent you a friend request.` },
      data: { user: user._id.toString(), type: NotificationType.FRIEND_REQUEST },
    });

    return friendRequest;
  }

  @Get('friend-request/find-all')
  async findAllFriendRequests(@GetUser() user: UserDocument, @Query() { receiver }: FindAllFriendRequestsQueryDto) {
    let condition = {};
    if (!receiver) condition = { sender: user._id };
    else condition = { receiver };
    return await this.friendRequestService.find(condition);
  }

  @Delete('friend-request/:id/delete')
  async deleteFriendRequest(@Param('id', ParseObjectId) id: string) {
    const friendRequest = await this.friendRequestService.deleteSingleRecord({ _id: id });
    if (!friendRequest) throw new BadRequestException('Friend request does not exists.');
    return friendRequest;
  }

  @Put('friend-request/:id/approve-reject')
  async approveRejectFriendRequest(@Body('isApproved', new ParseBoolPipe()) isApproved: boolean, @Param('id', ParseObjectId) id: string) {
    const friendRequest = await this.friendRequestService.deleteSingleRecord({ _id: id });
    if (!friendRequest) throw new BadRequestException('Friend Request does not exists.');
    if (isApproved) {
      await this.usersService.findOneRecordAndUpdate({ _id: friendRequest.sender }, { $push: { friends: friendRequest.receiver } });
      await this.usersService.findOneRecordAndUpdate({ _id: friendRequest.receiver }, { $push: { friends: friendRequest.sender } });
    }
    return friendRequest;
  }
}
