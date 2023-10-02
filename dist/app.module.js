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
const file_module_1 = require("./file/file.module");
const fudraising_module_1 = require("./fundraising/fudraising.module");
const notification_module_1 = require("./notification/notification.module");
const report_module_1 = require("./report/report.module");
const search_module_1 = require("./search/search.module");
const firebase_module_1 = require("./firebase/firebase.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const review_module_1 = require("./review/review.module");
const mute_module_1 = require("./mute/mute.module");
const broadcast_module_1 = require("./broadcast/broadcast.module");
const page_module_1 = require("./page/page.module");
const redisStore = require("cache-manager-redis-store");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            common_1.CacheModule.register({
                isGlobal: true,
                store: redisStore,
                host: 'localhost',
                port: 6379
            }),
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
            file_module_1.FileModule,
            fudraising_module_1.FundraisingModule,
            notification_module_1.NotificationModule,
            report_module_1.ReportModule,
            search_module_1.SearchModule,
            firebase_module_1.FirebaseModule,
            dashboard_module_1.DashboardModule,
            review_module_1.ReviewModule,
            mute_module_1.MuteModule,
            broadcast_module_1.BroadcastModule,
            page_module_1.PageModule,
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