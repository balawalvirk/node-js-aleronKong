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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const socket_gateway_1 = require("../helpers/gateway/socket.gateway");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const message_service_1 = require("./message.service");
let ChatController = class ChatController {
    constructor(chatService, messageService, socketService) {
        this.chatService = chatService;
        this.messageService = messageService;
        this.socketService = socketService;
    }
    async createChat(receiverId, user) {
        return (await this.chatService.createRecord({ members: [user._id, receiverId] })).populate({
            path: 'members',
            match: { _id: { $ne: user._id } },
            select: 'avatar firstName lastName',
        });
    }
    async recentChat(user) {
        return await this.chatService.findAllRecords({ members: { $in: [user._id] } }).populate({
            path: 'members',
            match: { _id: { $ne: user._id } },
            select: 'avatar firstName lastName',
        });
    }
    async findOne(receiverId, user) {
        return await this.chatService
            .findOneRecord({ members: { $all: [receiverId, user._id] } })
            .populate({
            path: 'members',
            match: { _id: { $ne: user._id } },
            select: 'avatar firstName lastName',
        });
    }
    async createMessage(body, user) {
        const message = await this.messageService.createRecord(Object.assign(Object.assign({}, body), { sender: user._id }));
        this.socketService.triggerMessage(body.chat, message);
        return 'message sent successfully.';
    }
    async findAllMessage(chatId) {
        return await this.messageService.findAllRecords({ chat: chatId }).sort({ createdAt: -1 });
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "findAllMessage", null);
ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        message_service_1.MessageService,
        socket_gateway_1.SocketGateway])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map