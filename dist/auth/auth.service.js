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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt_1 = require("bcrypt");
const mongoose_2 = require("mongoose");
const helpers_1 = require("../helpers");
const users_service_1 = require("../users/users.service");
const otp_schema_1 = require("./otp.schema");
const notification_service_1 = require("../notification/notification.service");
const types_1 = require("../types");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService, stripeService, NotificationService, otpModal) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.stripeService = stripeService;
        this.NotificationService = NotificationService;
        this.otpModal = otpModal;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOne({ email });
        if (!user)
            return null;
        const match = await (0, bcrypt_1.compare)(pass, user.password);
        if (!match)
            return null;
        const { password } = user, result = __rest(user, ["password"]);
        return result;
    }
    async login(userName, userId) {
        const payload = { username: userName, sub: userId };
        return {
            access_token: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_TOKEN_SECRET'),
            }),
        };
    }
    AddMinutesToDate(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }
    async createOtp(body) {
        return await this.otpModal.create(body);
    }
    async findOneOtp(filter) {
        return await this.otpModal.findOne(filter);
    }
    async findOnePaymentMethod(id) {
        return await this.stripeService.findOnePaymentMethod(id);
    }
    async findNotifications(userId) {
        const Notifications = await this.NotificationService.findAllRecords({ receiver: userId, isRead: false });
        const unReadMessages = Notifications.filter((notification) => notification.type === types_1.NotificationType.NEW_MESSAGE);
        const unReadNotifications = Notifications.filter((notification) => notification.type !== types_1.NotificationType.NEW_MESSAGE);
        return { unReadMessages, unReadNotifications };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, mongoose_1.InjectModel)(otp_schema_1.Otp.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        helpers_1.StripeService,
        notification_service_1.NotificationService,
        mongoose_2.Model])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map