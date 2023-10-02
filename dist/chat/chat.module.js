"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const mongoose_1 = require("@nestjs/mongoose");
const chat_schema_1 = require("./chat.schema");
const chat_controller_1 = require("./chat.controller");
const socket_gateway_1 = require("../helpers/gateway/socket.gateway");
const messages_schema_1 = require("./messages.schema");
const message_service_1 = require("./message.service");
const notification_module_1 = require("../notification/notification.module");
const firebase_module_1 = require("../firebase/firebase.module");
const mute_module_1 = require("../mute/mute.module");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: chat_schema_1.Chat.name, schema: chat_schema_1.ChatSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: messages_schema_1.Message.name, schema: messages_schema_1.MessageSchema }]),
            notification_module_1.NotificationModule,
            firebase_module_1.FirebaseModule,
            mute_module_1.MuteModule,
        ],
        providers: [chat_service_1.ChatService, socket_gateway_1.SocketGateway, message_service_1.MessageService],
        controllers: [chat_controller_1.ChatController],
        exports: [message_service_1.MessageService, chat_service_1.ChatService],
    })
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map