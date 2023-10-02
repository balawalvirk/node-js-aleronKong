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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const chat_schema_1 = require("./chat.schema");
let ChatService = class ChatService extends base_service_1.BaseService {
    constructor(ChatModel) {
        super(ChatModel);
        this.ChatModel = ChatModel;
    }
    async create(members, userId) {
        return (await this.ChatModel.create({ members })).populate({
            path: 'members',
            match: { _id: { $ne: userId } },
            select: 'avatar firstName lastName',
        });
    }
    async findAll(query, userId, options) {
        return await this.ChatModel.find(query, {}, options).populate([
            { path: 'members', match: { _id: { $ne: userId } }, select: 'avatar firstName lastName' },
            { path: 'lastMessage' },
            { path: 'messages', match: { isRead: false, receiver: userId } },
            { path: 'mutes' },
        ]);
    }
    async findOne(query, userId) {
        return await this.ChatModel.findOne(query).populate([
            { path: 'members', match: { _id: { $ne: userId } }, select: 'avatar firstName lastName' },
            { path: 'mutes' },
        ]);
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_schema_1.Chat.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map