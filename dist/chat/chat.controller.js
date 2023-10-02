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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const helpers_1 = require("../helpers");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const socket_gateway_1 = require("../helpers/gateway/socket.gateway");
const firebase_service_1 = require("../firebase/firebase.service");
const notification_service_1 = require("../notification/notification.service");
const types_1 = require("../types");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const mute_chat_dto_1 = require("./dto/mute-chat.dto");
const message_service_1 = require("./message.service");
const mute_service_1 = require("../mute/mute.service");
let ChatController = class ChatController {
    constructor(chatService, messageService, socketService, notificationService, firebaseService, muteService) {
        this.chatService = chatService;
        this.messageService = messageService;
        this.socketService = socketService;
        this.notificationService = notificationService;
        this.firebaseService = firebaseService;
        this.muteService = muteService;
    }
    async createChat(receiverId, user) {
        const chat = await this.chatService.findOneRecord({ members: { $all: [receiverId, user._id] } });
        if (chat)
            throw new common_1.HttpException('You already have chat with this member.', common_1.HttpStatus.BAD_REQUEST);
        return await this.chatService.create([user._id, receiverId], user._id);
    }
    async recentChat(user) {
        return await this.chatService.findAll({ members: { $in: [user._id] } }, user._id, { sort: { updatedAt: -1 } });
    }
    async findOne(receiverId, user) {
        return await this.chatService.findOne({ members: { $all: [receiverId, user._id] } }, user._id);
    }
    async createMessage(createMessageDto, user) {
        const chatFound = await this.chatService.findOneRecord({ _id: createMessageDto.chat }).populate('members');
        const receiver = chatFound.members.find((member) => !member._id.equals(user._id));
        const message = await this.messageService.createRecord(Object.assign(Object.assign({}, createMessageDto), { sender: user._id, receiver: receiver._id }));
        const chat = await this.chatService.findOneRecordAndUpdate({ _id: createMessageDto.chat }, { lastMessage: message._id, $push: { messages: message._id } });
        this.socketService.triggerMessage(createMessageDto.chat, message);
        this.socketService.triggerMessage('new-message', { chat: createMessageDto.chat, lastMessage: message });
        await this.notificationService.createRecord({
            message: 'has sent you a message.',
            sender: user._id,
            receiver: receiver._id,
            type: types_1.NotificationType.NEW_MESSAGE,
            user: user._id,
        });
        if (chat.mutes.length > 0) {
            const mute = chat.mutes.find((chat) => chat.user === user._id);
            if (mute) {
                const today = new Date();
                if (mute.interval === types_1.MuteInterval.DAY || types_1.MuteInterval.WEEK) {
                    if (mute.date.getTime() < today.getTime()) {
                        await this.firebaseService.sendNotification({
                            token: receiver.fcmToken,
                            notification: { title: `${user.firstName} ${user.lastName} has send you message.` },
                            data: { user: user._id.toString(), type: types_1.NotificationType.NEW_MESSAGE },
                        });
                    }
                }
                else {
                    if (today.getTime() <= mute.startTime.getTime() && today.getTime() >= mute.endTime.getTime()) {
                        return;
                    }
                    else {
                        await this.firebaseService.sendNotification({
                            token: receiver.fcmToken,
                            notification: { title: `${user.firstName} ${user.lastName} has send you message.` },
                            data: { user: user._id.toString(), type: types_1.NotificationType.NEW_MESSAGE },
                        });
                    }
                }
            }
        }
        else {
            await this.firebaseService.sendNotification({
                token: receiver.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} has send you message.` },
                data: { user: user._id.toString(), type: types_1.NotificationType.NEW_MESSAGE },
            });
        }
        return { message: 'message sent successfully.' };
    }
    async findAllMessage(chatId, user) {
        const messages = await this.messageService.findAllRecords({ chat: chatId }).sort({ createdAt: 1 });
        await this.messageService.updateManyRecords({ chat: chatId, isRead: false, receiver: user._id }, { isRead: true });
        return messages;
    }
    async delete(id) {
        const chat = await this.chatService.deleteSingleRecord({ _id: id });
        await this.messageService.deleteManyRecord({ chat: chat._id });
        return { message: 'Conversation deleted successfully.' };
    }
    async mute(muteChatDto, user) {
        const now = new Date();
        let date = new Date(now);
        let updatedObj = { user: user._id, interval: muteChatDto.interval, chat: muteChatDto.chat };
        if (muteChatDto.interval === types_1.MuteInterval.DAY) {
            date.setDate(now.getDate() + 1);
        }
        else if (muteChatDto.interval === types_1.MuteInterval.WEEK) {
            date.setDate(now.getDate() + 7);
        }
        date.toLocaleDateString();
        if (muteChatDto.interval === types_1.MuteInterval.DAY || types_1.MuteInterval.WEEK) {
            updatedObj = Object.assign(Object.assign({}, updatedObj), { date });
        }
        else {
            updatedObj = Object.assign(Object.assign({}, updatedObj), { startTime: muteChatDto.startTime, endTime: muteChatDto.endTime });
        }
        const muteFound = await this.muteService.findOneRecord({ user: user._id, chat: muteChatDto.chat });
        if (muteFound) {
            const { user, chat } = updatedObj, rest = __rest(updatedObj, ["user", "chat"]);
            return await this.muteService.findOneRecordAndUpdate({ _id: muteFound._id }, rest);
        }
        else {
            const mute = await this.muteService.createRecord(updatedObj);
            await this.chatService.findOneRecordAndUpdate({ _id: muteChatDto.chat }, { $push: { mutes: mute._id } });
            return mute;
        }
    }
    async unMute(id) {
        const mute = await this.muteService.deleteSingleRecord({ _id: id });
        if (!mute)
            throw new common_1.HttpException('Mute does not exists.', common_1.HttpStatus.BAD_REQUEST);
        await this.chatService.findOneRecordAndUpdate({ _id: mute.chat }, { $pull: { mutes: mute._id } });
        return mute;
    }
    async readMessages(id) {
        await this.messageService.updateManyRecords({ chat: id, isRead: false }, { isRead: true });
        return { message: 'Message read successfully.' };
    }
};
__decorate([
    (0, common_1.Post)('/create'),
    __param(0, (0, common_1.Body)('receiverId')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createChat", null);
__decorate([
    (0, common_1.Get)('/recent-chat'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "recentChat", null);
__decorate([
    (0, common_1.Get)('/find-one/:receiverId'),
    __param(0, (0, common_1.Param)('receiverId')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('/message/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('/message/find-all/:chatId'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "findAllMessage", null);
__decorate([
    (0, common_1.Delete)('/delete/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)('mute'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mute_chat_dto_1.MuteChatDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "mute", null);
__decorate([
    (0, common_1.Put)(':id/un-mute'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "unMute", null);
__decorate([
    (0, common_1.Put)(':id/read-messages'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "readMessages", null);
ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        message_service_1.MessageService,
        socket_gateway_1.SocketGateway,
        notification_service_1.NotificationService,
        firebase_service_1.FirebaseService,
        mute_service_1.MuteService])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map