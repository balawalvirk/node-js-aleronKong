"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const bcrypt_1 = require("bcrypt");
const change_pass_dto_1 = require("../auth/dtos/change-pass.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const role_guard_1 = require("../auth/role.guard");
const message_service_1 = require("../chat/message.service");
const firebase_service_1 = require("../firebase/firebase.service");
const group_service_1 = require("../group/group.service");
const helpers_1 = require("../helpers");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const notification_service_1 = require("../notification/notification.service");
const cart_service_1 = require("../product/cart.service");
const types_1 = require("../types");
const approve_reject_seller_dto_1 = require("./dtos/approve-reject-seller.dto");
const complete_profile_dto_1 = require("./dtos/complete-profile.dto");
const create_bank_account_dto_1 = require("./dtos/create-bank-account.dto");
const create_payout_dto_1 = require("./dtos/create-payout.dto");
const create_seller_dto_1 = require("./dtos/create-seller.dto");
const find_all_friend_requests_query_dto_1 = require("./dtos/find-all-friend-requests.query.dto");
const find_all_users_query_dto_1 = require("./dtos/find-all-users.query.dto");
const find_transections_query_dto_1 = require("./dtos/find-transections.query.dto");
const update_bank_account_dto_1 = require("./dtos/update-bank-account.dto");
const update_user_1 = require("./dtos/update-user");
const friend_request_service_1 = require("./friend-request.service");
const users_service_1 = require("./users.service");
let UserController = class UserController {
    constructor(usersService, stripeService, notificationService, firebaseService, messageService, cartService, friendRequestService, groupService) {
        this.usersService = usersService;
        this.stripeService = stripeService;
        this.notificationService = notificationService;
        this.firebaseService = firebaseService;
        this.messageService = messageService;
        this.cartService = cartService;
        this.friendRequestService = friendRequestService;
        this.groupService = groupService;
    }
    async setupProfile(updateUserDto, user) {
        return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, updateUserDto);
    }
    async completeProfile(completeProfileDto, user) {
        const userFound = await this.usersService.findOneRecord({ _id: user._id });
        if (!userFound)
            throw new common_1.BadRequestException('User does not exists.');
        const customer = await this.usersService.createCustomerAccount(userFound.email, `${completeProfileDto.firstName} ${completeProfileDto.lastName}`);
        return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, Object.assign(Object.assign({}, completeProfileDto), { customerId: customer.id }));
    }
    async findOne(id, user) {
        const userFound = await this.usersService.findOneRecord({ _id: id });
        const friendRequest = await this.friendRequestService.findOneRecord({ sender: user._id, receiver: id });
        if (friendRequest)
            return Object.assign(Object.assign({}, userFound.toJSON()), { friendRequest });
        else
            return userFound;
    }
    async findAll({ page, limit, query, role }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const rjx = { $regex: query, $options: 'i' };
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const condition = {
            role: { $nin: [types_1.UserRoles.ADMIN], $in: [role] },
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
    async blockUser(id, user) {
        if (user.role.includes(types_1.UserRoles.ADMIN)) {
            await this.usersService.findOneRecordAndUpdate({ _id: id }, { status: types_1.UserStatus.BLOCKED });
            return { message: 'User blocked successfully.' };
        }
        else {
            if (user._id == id)
                throw new common_1.BadRequestException('You cannot block yourself.');
            const userFound = await this.usersService.findOneRecord({ _id: user._id, blockedUsers: { $in: [id] } });
            if (userFound)
                throw new common_1.BadRequestException('You already blocked this user.');
            return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { blockedUsers: id } });
        }
    }
    async unBlock(id, user) {
        if (user.role.includes(types_1.UserRoles.ADMIN)) {
            await this.usersService.findOneRecordAndUpdate({ _id: id }, { status: types_1.UserStatus.ACTIVE });
            return { message: 'User unblocked successfully.' };
        }
        else {
            return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { blockedUsers: id } });
        }
    }
    async changePassword({ newPassword, oldPassword }, user) {
        const userFound = await this.usersService.findOneRecord({ _id: user._id });
        const match = await (0, bcrypt_1.compare)(oldPassword, userFound.password);
        if (!match)
            throw new common_1.BadRequestException('Invalid old password.');
        await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { password: await (0, bcrypt_1.hash)(newPassword, 10) });
        return { message: 'Password changed successfully.' };
    }
    async createBankAccount(user, { accountHolderName, accountNumber, routingNumber }) {
        const bankAccount = await this.stripeService.createBankAccount(user.sellerId, {
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
    async findAllBankAccounts(user) {
        const bankAccounts = await this.stripeService.findAllBankAccounts(user.sellerId, { object: 'bank_account' });
        return bankAccounts.data;
    }
    async deleteBankAccount(user, bankAccount) {
        await this.stripeService.deleteBankAccount(user.sellerId, bankAccount);
        return { message: 'Account deleted successfully.' };
    }
    async updateBankAccount(bankAccount, user, updateBankAccountDto) {
        const account = await this.stripeService.updateBankAccount(user.sellerId, bankAccount, updateBankAccountDto);
        if (updateBankAccountDto.default_for_currency)
            await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { defaultWithDrawAccountId: account.id });
        return account;
    }
    async createPayout({ amount }, user) {
        await this.stripeService.createConnectedAccountPayout({ currency: 'usd', amount: amount * 100 }, { stripeAccount: user.sellerId });
        return { message: 'Amount withdraw successfully.' };
    }
    async addFriend(id, user) {
        if (user._id == id)
            throw new common_1.BadRequestException('You cannot add yourself as a friend.');
        const userFound = await this.usersService.findOneRecord({ _id: user._id, friends: { $in: [id] } });
        if (userFound)
            throw new common_1.BadRequestException('User is already your friend.');
        const friend = await this.usersService.findOneRecord({ _id: id });
        const updatedUser = await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $push: { friends: id } });
        await this.notificationService.createRecord({
            user: user._id,
            message: 'started following you.',
            type: types_1.NotificationType.USER_FOLLOWING,
            sender: user._id,
            receiver: id,
        });
        if (friend.fcmToken) {
            await this.firebaseService.sendNotification({
                token: friend.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} started following you.` },
                data: { user: user._id.toString(), type: types_1.NotificationType.USER_FOLLOWING },
            });
        }
        return updatedUser;
    }
    async removeFriend(id, user) {
        const isFriend = user.friends.find((friend) => friend.equals(id));
        if (!isFriend)
            throw new common_1.BadRequestException('User is not your friend.');
        await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { friends: id } });
        return await this.usersService.findOneRecordAndUpdate({ _id: id }, { $pull: { friends: user._id } });
    }
    async findAllFriends(user, paginationDto) {
        const condition = { _id: { $in: user.friends } };
        if (paginationDto) {
            const $q = (0, helpers_1.makeQuery)({ page: paginationDto.page, limit: paginationDto.limit });
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
        else {
            return await this.usersService.findAllRecords(condition);
        }
    }
    async findAllSuggestedFriends(user, { limit, page }) {
        const userFound = await this.usersService.findOneRecord({ _id: user._id }).populate({ path: 'friends' });
        const suggestedFriends = userFound.friends.map((friend) => friend.friends).flat(Infinity);
        const groups = await this.groupService.findAllRecords({ 'members.member': user._id });
        const groupMembers = groups
            .map((group) => group.members)
            .flat(Infinity)
            .map((member) => member.member);
        const allUsers = [...suggestedFriends, ...groupMembers].filter((usr) => !usr.equals(user._id));
        const $q = (0, helpers_1.makeQuery)({ page, limit });
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
    async home(user) {
        var _a;
        const messages = await this.messageService.countRecords({ receiver: user._id, isRead: false });
        const notifications = await this.notificationService.countRecords({ receiver: user._id, isRead: false });
        const cart = await this.cartService.findOneRecord({ creator: user._id });
        return { messages, notifications, cartItems: ((_a = cart === null || cart === void 0 ? void 0 : cart.items) === null || _a === void 0 ? void 0 : _a.length) || 0 };
    }
    async findUnreadMessages(user) {
        const messages = await this.messageService.countRecords({ receiver: user._id, isRead: false });
        return { messages };
    }
    async findUnreadNotifications(user) {
        const notifications = await this.notificationService.countRecords({ receiver: user._id, isRead: false });
        return { notifications };
    }
    async createSeller(createSellerDto, user, ip) {
        const userFound = await this.usersService.findOneRecord({ _id: user._id });
        if (!userFound)
            throw new common_1.BadRequestException('User does not exists.');
        if (userFound.sellerRequest === types_1.SellerRequest.PENDING)
            throw new common_1.BadRequestException('Your seller request is already under consideration.');
        const { city, line1, ssnLast4, state, postalCode, phoneNumber } = createSellerDto;
        const { email, firstName, lastName, birthDate } = userFound;
        const dob = new Date(birthDate);
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
        await this.usersService.findOneRecordAndUpdate({ _id: user._id }, Object.assign({ ip, sellerRequest: types_1.SellerRequest.PENDING, sellerId: seller.id }, createSellerDto));
        const admin = await this.usersService.findOneRecord({ role: { $in: [types_1.UserRoles.ADMIN] } });
        await this.notificationService.createRecord({
            type: types_1.NotificationType.SELLER_REQUEST,
            message: 'A new request for seller approval.',
            sender: user._id,
            user: user._id,
            receiver: admin._id,
        });
        if (admin.fcmToken) {
            await this.firebaseService.sendNotification({
                token: admin.fcmToken,
                notification: { title: 'A new request for seller approval.' },
                data: { user: user._id, type: types_1.NotificationType.SELLER_REQUEST },
            });
        }
        return 'Your request for seller is under consideration.';
    }
    async approveRejectSeller({ sellerRequest, user }) {
        const userFound = await this.usersService.findOneRecord({ _id: user });
        if (!userFound)
            throw new common_1.BadRequestException('User does not exists.');
        if (sellerRequest === types_1.SellerRequest.APPROVED) {
            await this.stripeService.updateAccount(userFound.sellerId, {
                settings: {
                    payouts: {
                        schedule: {
                            interval: 'daily',
                            delay_days: 16,
                        },
                    },
                },
            });
            await this.usersService.findOneRecordAndUpdate({ _id: userFound._id }, { role: [types_1.UserRoles.SELLER, types_1.UserRoles.CUSTOMER], sellerRequest: types_1.SellerRequest.APPROVED });
        }
        else if (sellerRequest === types_1.SellerRequest.REJECTED) {
            await this.stripeService.deleteAccount(userFound.sellerId);
            await this.usersService.findOneRecordAndUpdate({ _id: user }, { sellerRequest: types_1.SellerRequest.REJECTED, $unset: { sellerId: 1 } });
        }
        await this.notificationService.createRecord({
            type: types_1.NotificationType.SELLER_REQUEST_APPROVED_REJECTED,
            message: `Your seller request has been ${sellerRequest}`,
            receiver: userFound._id,
        });
        if (userFound.fcmToken) {
            await this.firebaseService.sendNotification({
                token: userFound.fcmToken,
                notification: { title: `Your seller request has been ${sellerRequest}` },
                data: { user: userFound._id, type: types_1.NotificationType.SELLER_REQUEST_APPROVED_REJECTED },
            });
        }
        return 'Request approved successfully.';
    }
    async findAllSellerRequests({ page, limit, query }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
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
            sellerRequest: types_1.SellerRequest.PENDING,
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
    async checkSellerStatus(user) {
        const userFound = await this.usersService.findOneRecord({ _id: user._id });
        return { sellerRequest: userFound.sellerRequest };
    }
    async findEarnings(user) {
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
        return Object.assign(Object.assign({}, balance), { totalVolume });
    }
    async findAllTransections(user, { limit, lastRecord, duration }) {
        const date = new Date();
        let startDate;
        if (duration === types_1.TransectionDuration.WEEK)
            startDate = Math.floor(new Date(date.setDate(date.getDate() - date.getDay())).getTime() / 1000);
        else if (duration === types_1.TransectionDuration.MONTH)
            startDate = Math.floor(new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000);
        else if (duration === types_1.TransectionDuration.YEAR)
            startDate = Math.floor(new Date(date.getFullYear(), 0, 1).getTime() / 1000);
        const transfers = await this.stripeService.findAllTransfers({
            limit: limit,
            destination: user.sellerId,
            starting_after: lastRecord,
            created: { gt: startDate },
        });
        return transfers.data;
    }
    async createFriendRequest(user, receiver) {
        const friendRequestExists = await this.friendRequestService.findOneRecord({ receiver, sender: user._id });
        if (friendRequestExists)
            throw new common_1.BadRequestException('Friend request for this user exists already.');
        const friendRequest = await this.friendRequestService.create({ receiver, sender: user._id });
        await this.notificationService.createRecord({
            sender: user._id,
            receiver: receiver,
            user: user._id,
            message: 'sent you a friend request.',
            type: types_1.NotificationType.FRIEND_REQUEST,
        });
        await this.firebaseService.sendNotification({
            token: friendRequest.receiver.fcmToken,
            notification: { title: `${user.firstName} ${user.lastName} sent you a friend request.` },
            data: { user: user._id.toString(), type: types_1.NotificationType.FRIEND_REQUEST },
        });
        return friendRequest;
    }
    async findAllFriendRequests(user, { receiver }) {
        let condition = {};
        if (!receiver)
            condition = { sender: user._id };
        else
            condition = { receiver };
        return await this.friendRequestService.find(condition);
    }
    async deleteFriendRequest(id) {
        const friendRequest = await this.friendRequestService.deleteSingleRecord({ _id: id });
        if (!friendRequest)
            throw new common_1.BadRequestException('Friend request does not exists.');
        return friendRequest;
    }
    async approveRejectFriendRequest(isApproved, id) {
        const friendRequest = await this.friendRequestService.deleteSingleRecord({ _id: id });
        if (!friendRequest)
            throw new common_1.BadRequestException('Friend Request does not exists.');
        if (isApproved) {
            await this.usersService.findOneRecordAndUpdate({ _id: friendRequest.sender }, { $push: { friends: friendRequest.receiver } });
            await this.usersService.findOneRecordAndUpdate({ _id: friendRequest.receiver }, { $push: { friends: friendRequest.sender } });
        }
        return friendRequest;
    }
};
__decorate([
    (0, common_1.Put)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setupProfile", null);
__decorate([
    (0, common_1.Put)('/complete-profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_profile_dto_1.CompleteProfileDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "completeProfile", null);
__decorate([
    (0, common_1.Get)('find-one/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Get)('find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_users_query_dto_1.FindAllUsersQueryDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id/block'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Put)(':id/unblock'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unBlock", null);
__decorate([
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_pass_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('bank-account/create'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_bank_account_dto_1.CreateBankAccountDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createBankAccount", null);
__decorate([
    (0, common_1.Get)('bank-account/find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllBankAccounts", null);
__decorate([
    (0, common_1.Delete)('bank-account/:bankAccount/delete'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('bankAccount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteBankAccount", null);
__decorate([
    (0, common_1.Put)('bank-account/:bankAccount/update'),
    __param(0, (0, common_1.Param)('bankAccount')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_bank_account_dto_1.UpdateBankAccountDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateBankAccount", null);
__decorate([
    (0, common_1.Post)('payout/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payout_dto_1.CreatePayoutDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createPayout", null);
__decorate([
    (0, common_1.Put)('friend/:id/create'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addFriend", null);
__decorate([
    (0, common_1.Put)('friend/:id/remove'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "removeFriend", null);
__decorate([
    (0, common_1.Get)('friend/find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, helpers_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllFriends", null);
__decorate([
    (0, common_1.Get)('suggested-friends/find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, helpers_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllSuggestedFriends", null);
__decorate([
    (0, common_1.Get)('home'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "home", null);
__decorate([
    (0, common_1.Get)('unread-messages'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findUnreadMessages", null);
__decorate([
    (0, common_1.Get)('unread-notifications'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findUnreadNotifications", null);
__decorate([
    (0, common_1.Put)('seller/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_seller_dto_1.CreateSellerDto, Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createSeller", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Put)('seller/approve-reject'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [approve_reject_seller_dto_1.ApproveRejectSellerDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "approveRejectSeller", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Get)('seller/find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helpers_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllSellerRequests", null);
__decorate([
    (0, common_1.Get)('seller/check-status'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "checkSellerStatus", null);
__decorate([
    (0, common_1.Get)('earnings'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findEarnings", null);
__decorate([
    (0, common_1.Get)('/seller/transection/find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_transections_query_dto_1.FindTransectionsQueryDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllTransections", null);
__decorate([
    (0, common_1.Post)('friend-request/create'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('receiver', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createFriendRequest", null);
__decorate([
    (0, common_1.Get)('friend-request/find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_all_friend_requests_query_dto_1.FindAllFriendRequestsQueryDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllFriendRequests", null);
__decorate([
    (0, common_1.Delete)('friend-request/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteFriendRequest", null);
__decorate([
    (0, common_1.Put)('friend-request/:id/approve-reject'),
    __param(0, (0, common_1.Body)('isApproved', new common_1.ParseBoolPipe())),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "approveRejectFriendRequest", null);
UserController = __decorate([
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        helpers_1.StripeService,
        notification_service_1.NotificationService,
        firebase_service_1.FirebaseService,
        message_service_1.MessageService,
        cart_service_1.CartService,
        friend_request_service_1.FriendRequestService,
        group_service_1.GroupService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=users.controller.js.map