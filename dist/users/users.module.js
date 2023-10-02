"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const chat_module_1 = require("../chat/chat.module");
const firebase_module_1 = require("../firebase/firebase.module");
const group_module_1 = require("../group/group.module");
const helpers_1 = require("../helpers");
const notification_module_1 = require("../notification/notification.module");
const order_module_1 = require("../order/order.module");
const product_module_1 = require("../product/product.module");
const users_schema_1 = require("./users.schema");
const friend_request_schema_1 = require("./friend-request.schema");
const friend_request_service_1 = require("./friend-request.service");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: users_schema_1.User.name, schema: users_schema_1.UserSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: friend_request_schema_1.FriendRequest.name, schema: friend_request_schema_1.FriendRequestSchema }]),
            notification_module_1.NotificationModule,
            firebase_module_1.FirebaseModule,
            order_module_1.OrderModule,
            chat_module_1.ChatModule,
            product_module_1.ProductModule,
            group_module_1.GroupModule,
        ],
        controllers: [users_controller_1.UserController],
        providers: [users_service_1.UsersService, helpers_1.StripeService, friend_request_service_1.FriendRequestService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map