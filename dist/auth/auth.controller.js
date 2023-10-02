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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const bcrypt_1 = require("bcrypt");
const users_service_1 = require("../users/users.service");
const auth_service_1 = require("./auth.service");
const local_auth_guard_1 = require("./local-auth.guard");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const register_dto_1 = require("./dtos/register.dto");
const reset_pass_dto_1 = require("./dtos/reset-pass.dto");
const social_login_dto_1 = require("./dtos/social-login.dto");
const email_service_1 = require("../helpers/services/email.service");
const cart_service_1 = require("../product/cart.service");
const types_1 = require("../types");
const platform_express_1 = require("@nestjs/platform-express");
const file_service_1 = require("../file/file.service");
const config_1 = require("@nestjs/config");
let AuthController = class AuthController {
    constructor(authService, userService, emailService, cartService, fileService, configService) {
        this.authService = authService;
        this.userService = userService;
        this.emailService = emailService;
        this.cartService = cartService;
        this.fileService = fileService;
        this.configService = configService;
    }
    async login(user) {
        var _a;
        let paymentMethod = null;
        const { access_token } = await this.authService.login(user.userName, user._id);
        const cart = await this.cartService.findOneRecord({ creator: user._id });
        if (user.defaultPaymentMethod)
            paymentMethod = await this.authService.findOnePaymentMethod(user.defaultPaymentMethod);
        return {
            access_token,
            user: Object.assign(Object.assign({}, user), { defaultPaymentMethod: paymentMethod, cartItems: ((_a = cart === null || cart === void 0 ? void 0 : cart.items) === null || _a === void 0 ? void 0 : _a.length) || 0 }),
        };
    }
    async adminLogin(user) {
        if (!user.role.includes(types_1.UserRoles.ADMIN))
            throw new common_1.UnauthorizedException('Invalid email/password.');
        const { access_token } = await this.authService.login(user.userName, user._id);
        return { access_token, user };
    }
    async register(registerDto, ip, avatar) {
        const emailExists = await this.userService.findOneRecord({ email: registerDto.email });
        if (emailExists)
            throw new common_1.BadRequestException('User already exists with this email.');
        let user;
        if (avatar) {
            const key = await this.fileService.upload(avatar);
            registerDto.avatar = `${this.configService.get('S3_URL')}${key}`;
        }
        if (registerDto.firstName && registerDto.lastName && registerDto.email) {
            const customerAccount = await this.userService.createCustomerAccount(registerDto.email, `${registerDto.firstName} ${registerDto.lastName}`);
            user = await this.userService.createRecord(Object.assign(Object.assign({}, registerDto), { password: await (0, bcrypt_1.hash)(registerDto.password, 10), customerId: customerAccount.id }));
        }
        else {
            user = await this.userService.createRecord(Object.assign(Object.assign({}, registerDto), { password: await (0, bcrypt_1.hash)(registerDto.password, 10) }));
        }
        const { access_token } = await this.authService.login(user.userName, user._id);
        return {
            message: 'User registered successfully.',
            data: {
                user: Object.assign(Object.assign({}, user.toJSON()), { unReadNotifications: 0, unReadMessages: 0, cartItems: 0 }),
                access_token,
            },
        };
    }
    async checkEmail(email) {
        const emailExists = await this.userService.findOneRecord({ email });
        if (emailExists)
            throw new common_1.BadRequestException('User already exists with this email.');
        return { message: 'User does not exist with this email' };
    }
    async socialLogin(socialLoginDto) {
        var _a;
        const userFound = await this.userService.findOneRecord({ email: socialLoginDto.email });
        if (!userFound) {
            const customerAccount = await this.userService.createCustomerAccount(socialLoginDto.email, `${socialLoginDto.firstName} ${socialLoginDto.lastName}`);
            const user = await this.userService.createRecord(Object.assign({ email: socialLoginDto.email, password: await (0, bcrypt_1.hash)(`${new Date().getTime()}`, 10), authType: socialLoginDto.authType, customerId: customerAccount.id }, socialLoginDto));
            const { access_token } = await this.authService.login(user.userName, user._id);
            return {
                access_token,
                user: Object.assign(Object.assign({}, user.toJSON()), { unReadNotifications: 0, unReadMessages: 0, cartItems: 0 }),
                newUser: true,
            };
        }
        else {
            if (userFound.authType !== socialLoginDto.authType)
                throw new common_1.BadRequestException('User already exists with this email.');
            let paymentMethod = null;
            const { access_token } = await this.authService.login(userFound.userName, userFound._id);
            const { unReadMessages, unReadNotifications } = await this.authService.findNotifications(userFound._id);
            const cart = await this.cartService.findOneRecord({ creator: userFound._id });
            if (userFound.defaultPaymentMethod) {
                paymentMethod = await this.authService.findOnePaymentMethod(userFound.defaultPaymentMethod);
            }
            return {
                access_token,
                user: Object.assign(Object.assign({}, userFound.toJSON()), { unReadNotifications,
                    unReadMessages, defaultPaymentMethod: paymentMethod, cartItems: ((_a = cart === null || cart === void 0 ? void 0 : cart.items) === null || _a === void 0 ? void 0 : _a.length) || 0 }),
                newUser: false,
            };
        }
    }
    async forgetPassword(email) {
        const userFound = await this.userService.findOneRecord({ email });
        if (!userFound)
            throw new common_1.BadRequestException('Email does not exists.');
        const otp = await this.authService.createOtp({
            otp: Math.floor(Math.random() * 10000 + 1),
            expireIn: new Date().getTime() + 300 * 1000,
            email,
        });
        const mail = {
            to: email,
            subject: 'Change Password request',
            from: 'awaismehr001@gmail.com',
            text: 'Hello World from NestJS Sendgrid',
            html: `<h1>password reset otp</h1> <br/> ${otp.otp} </br> This otp will expires in 5 minuutes`,
        };
        await this.emailService.send(mail);
        return { message: 'Otp sent to your email.' };
    }
    async resetPassword({ password, otp }) {
        const otpFound = await this.authService.findOneOtp({ otp });
        if (!otpFound)
            throw new common_1.BadRequestException('Invalid Otp.');
        const diff = otpFound.expireIn - new Date().getTime();
        if (diff < 0)
            throw new common_1.BadRequestException('Otp expired.');
        await this.userService.findOneRecordAndUpdate({ email: otpFound.email }, { password: await (0, bcrypt_1.hash)(password, 10) });
        return { message: 'Password changed successfully.' };
    }
};
__decorate([
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('admin/login'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('check-email'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkEmail", null);
__decorate([
    (0, common_1.Post)('social-login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [social_login_dto_1.SocialLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "socialLogin", null);
__decorate([
    (0, common_1.Post)('forget-password'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgetPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_pass_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        email_service_1.EmailService,
        cart_service_1.CartService,
        file_service_1.FileService,
        config_1.ConfigService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map