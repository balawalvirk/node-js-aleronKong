"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const posts_module_1 = require("./posts/posts.module");
const chat_module_1 = require("./chat/chat.module");
const product_module_1 = require("./product/product.module");
const group_module_1 = require("./group/group.module");
const package_module_1 = require("./package/package.module");
const payment_method_module_1 = require("./payment-method/payment-method.module");
const address_module_1 = require("./address/address.module");
const core_1 = require("@nestjs/core");
const helpers_1 = require("./helpers");
const order_module_1 = require("./order/order.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRoot(new config_1.ConfigService().get('MONGO_URI')),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            posts_module_1.PostsModule,
            chat_module_1.ChatModule,
            product_module_1.ProductModule,
            group_module_1.GroupModule,
            package_module_1.PackageModule,
            payment_method_module_1.PaymentMethodModule,
            address_module_1.AddressModule,
            order_module_1.OrderModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: helpers_1.TransformInterceptor,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map