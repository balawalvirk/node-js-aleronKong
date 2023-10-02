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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const comment_schema_1 = require("./comment.schema");
let CommentService = class CommentService extends base_service_1.BaseService {
    constructor(commentModel) {
        super(commentModel);
        this.commentModel = commentModel;
    }
    async create(query) {
        return await (await this.commentModel.create(query)).populate([
            { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
            { path: 'mentions', select: 'firstName lastName avatar' },
        ]);
    }
    getRepliesPopulateFields() {
        return {
            path: 'replies',
            options: { sort: { createdAt: -1 } },
            populate: [
                { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
            ],
        };
    }
    async find(query, options) {
        return await this.commentModel.find(query, {}, options).populate([
            { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
            { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
            { path: 'mentions', select: 'firstName lastName avatar' },
            {
                path: 'replies',
                options: { sort: { createdAt: -1 } },
                populate: [
                    { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                    { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
                    { path: 'mentions', select: 'firstName lastName avatar' },
                    {
                        path: 'replies',
                        options: { sort: { createdAt: -1 } },
                        populate: [
                            { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                            { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
                            { path: 'mentions', select: 'firstName lastName avatar' },
                            {
                                path: 'replies',
                                options: { sort: { createdAt: -1 } },
                                populate: [
                                    { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                                    { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
                                    { path: 'mentions', select: 'firstName lastName avatar' },
                                    {
                                        path: 'replies',
                                        options: { sort: { createdAt: -1 } },
                                        populate: [
                                            { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                                            { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
                                            { path: 'mentions', select: 'firstName lastName avatar' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]);
    }
    async update(query, updateQuery) {
        return await this.commentModel.findOneAndUpdate(query, updateQuery, { new: true }).populate([
            { path: 'creator', select: 'firstName lastName avatar' },
            { path: 'mentions', select: 'firstName lastName avatar' },
        ]);
    }
};
CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CommentService);
exports.CommentService = CommentService;
//# sourceMappingURL=comment.service.js.map