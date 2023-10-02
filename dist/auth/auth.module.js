"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const local_strategy_1 = require("./local.strategy");
const users_module_1 = require("../users/users.module");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const jwt_strategy_1 = require("./jwt.strategy");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const mongoose_1 = require("@nestjs/mongoose");
const otp_schema_1 = require("./otp.schema");
const email_service_1 = require("../helpers/services/email.service");
const helpers_1 = require("../helpers");
const notification_module_1 = require("../notification/notification.module");
const product_module_1 = require("../product/product.module");
const file_module_1 = require("../file/file.module");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            product_module_1.ProductModule,
            passport_1.PassportModule,
            notification_module_1.NotificationModule,
            file_module_1.FileModule,
            jwt_1.JwtModule.register({
                secret: new config_1.ConfigService().get('JWT_TOKEN_SECRET'),
                signOptions: { expiresIn: '15d' },
            }),
            mongoose_1.MongooseModule.forFeature([{ name: otp_schema_1.Otp.name, schema: otp_schema_1.OtpSchema }]),
        ],
        providers: [auth_service_1.AuthService, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy, email_service_1.EmailService, helpers_1.StripeService],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map