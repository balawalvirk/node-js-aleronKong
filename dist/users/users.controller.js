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
const helpers_1 = require("../helpers");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const update_user_1 = require("./dtos/update-user");
const users_service_1 = require("./users.service");
let UserController = class UserController {
    constructor(usersService, stripeService) {
        this.usersService = usersService;
        this.stripeService = stripeService;
    }
    async setupProfile(body, user) {
        return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, body);
    }
    async changePassword({ newPassword }, user) {
        await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { password: await (0, bcrypt_1.hash)(newPassword, 10) });
        return { message: 'Password changed successfully.' };
    }
    async createGuildMember(user) {
        const productId = 'prod_MkvBc9VwxnmWAd';
        const priceId = 'price_1M1PKmLyEqAWCXHoxHWq7yYw';
        await this.stripeService.createSubscription({
            customer: user.customerId,
            items: [{ price: priceId }],
            currency: 'usd',
        });
        return await this.usersService.findOneRecordAndUpdate({ _id: user._id }, { isGuildMember: true });
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
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_pass_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Put)('guild-member/create'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createGuildMember", null);
UserController = __decorate([
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        helpers_1.StripeService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=users.controller.js.map