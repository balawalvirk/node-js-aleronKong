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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const helpers_1 = require("../helpers");
const broadcast_service_1 = require("./broadcast.service");
const create_broadcast_dto_1 = require("./dto/create-broadcast.dto");
const agora_token_1 = require("agora-token");
const types_1 = require("../types");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const posts_service_1 = require("../posts/posts.service");
const cache_manager_1 = require("cache-manager");
const mongoose_1 = require("mongoose");
let BroadcastController = class BroadcastController {
    constructor(broadcastService, postService, configService, socketService, cacheManager) {
        this.broadcastService = broadcastService;
        this.postService = postService;
        this.configService = configService;
        this.socketService = socketService;
        this.cacheManager = cacheManager;
    }
    async create({ role, page }, user) {
        const channel = (0, crypto_1.randomBytes)(20).toString('hex');
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const expirationTime = 3600;
        const privilegeExpiredTs = currentTimestamp + expirationTime;
        const rtcRole = role === types_1.AGORA_RTC_ROLE.PUBLISHER ? agora_token_1.RtcRole.PUBLISHER : agora_token_1.RtcRole.SUBSCRIBER;
        const token = agora_token_1.RtcTokenBuilder.buildTokenWithUid(this.configService.get('AGORA_APP_ID'), this.configService.get('AGORA_APP_CERTIFICATE'), channel, '', rtcRole, expirationTime, privilegeExpiredTs);
        const broadcast = await this.broadcastService.create({ token, channel, user: user._id });
        this.socketService.triggerMessage('new-broadcast', broadcast);
        const { cname, uid, resourceId } = await this.broadcastService.acquireRecording(broadcast.channel);
        const { sid } = await this.broadcastService.startRecording(resourceId, cname, broadcast.token);
        const updatedBroadcast = await this.broadcastService.findOneRecordAndUpdate({ _id: broadcast._id }, { $set: { recording: { uid, resourceId, sid } } });
        const postId = new mongoose_1.default.Types.ObjectId();
        const postData = { _id: postId, privacy: types_1.PostPrivacy.PUBLIC, creator: user._id, page };
        await this.cacheManager.set((broadcast._id).toString(), JSON.stringify(postData), { ttl: 86400 });
        return Object.assign(Object.assign({}, updatedBroadcast._doc), { post: postData });
    }
    async findAll() {
        return await this.broadcastService.findAllRecords().sort({ createdAt: -1 }).populate('user');
    }
    async findOne(id) {
        return await this.broadcastService.findOneRecord({ _id: id }).populate('user');
    }
    async remove(id, user) {
        const broadcast = await this.broadcastService.deleteSingleRecord({ _id: id });
        if (!broadcast)
            throw new common_1.BadRequestException('Broadcast does not exists.');
        this.socketService.triggerMessage('remove-broadcast', broadcast);
        const stop = await this.broadcastService.stopRecording(broadcast.recording.resourceId, broadcast.channel, broadcast.recording.sid);
        let url = "";
        if (stop && stop.serverResponse) {
            const prefix = this.configService.get('S3_URL');
            url = `${prefix}${stop.serverResponse.fileList[0].fileName}`;
        }
        const postData = await this.cacheManager.get(id);
        if (postData) {
            const createPost = await this.postService.createRecord(JSON.parse(postData));
            await this.cacheManager.del(id);
        }
        return broadcast;
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.Header)('Cache-Control', 'private, no-cache, no-store, must-revalidate'),
    (0, common_1.Header)('Expires', '-1'),
    (0, common_1.Header)('Pragma', 'no-cache'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_broadcast_dto_1.CreateBroadcastDto, Object]),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/find-one'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "remove", null);
BroadcastController = __decorate([
    (0, common_1.Controller)('broadcast'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(4, (0, common_1.Inject)(common_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [broadcast_service_1.BroadcastService,
        posts_service_1.PostsService,
        config_1.ConfigService,
        helpers_1.SocketGateway, typeof (_a = typeof cache_manager_1.default !== "undefined" && cache_manager_1.default) === "function" ? _a : Object])
], BroadcastController);
exports.BroadcastController = BroadcastController;
//# sourceMappingURL=broadcast.controller.js.map