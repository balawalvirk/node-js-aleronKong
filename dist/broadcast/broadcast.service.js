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
exports.BroadcastService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const crypto_1 = require("crypto");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const broadcast_schema_1 = require("./broadcast.schema");
let BroadcastService = class BroadcastService extends base_service_1.BaseService {
    constructor(broadcastModel, configService, httpService) {
        super(broadcastModel);
        this.broadcastModel = broadcastModel;
        this.configService = configService;
        this.httpService = httpService;
        this.customerId = this.configService.get('AGORA_CUSTOMER_ID');
        this.customerSecret = this.configService.get('AGORA_CUSTOMER_SECRET');
        this.appId = this.configService.get('AGORA_APP_ID');
        this.Authorization = `Basic ${Buffer.from(`${this.customerId}:${this.customerSecret}`).toString('base64')}`;
        this.bucket = this.configService.get('S3_BUCKET_NAME');
        this.accessKey = this.configService.get('AWS_ACCESS_KEY');
        this.secretKey = this.configService.get('AWS_SECRET_KEY');
        this.uid = '12345';
    }
    async create(query) {
        return (await this.broadcastModel.create(query)).populate('user');
    }
    uidGenerator(length) {
        return (0, crypto_1.randomBytes)(length).toString('hex');
    }
    async acquireRecording(cname) {
        try {
            const url = `https://api.agora.io/v1/apps/${this.appId}/cloud_recording/acquire`;
            const options = { headers: { Authorization: this.Authorization } };
            const body = {
                cname,
                uid: this.uid,
                clientRequest: {
                    resourceExpiredHour: 24,
                },
            };
            const acquire = await this.httpService.axiosRef.post(url, body, options);
            return acquire.data;
        }
        catch (error) {
            console.log(error);
        }
    }
    async startRecording(resourceId, cname, token) {
        try {
            const url = `https://api.agora.io/v1/apps/${this.appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
            const body = {
                cname,
                uid: this.uid,
                clientRequest: {
                    token,
                    recordingFileConfig: {
                        avFileType: ['mp4', 'hls'],
                    },
                    storageConfig: {
                        vendor: 1,
                        region: 0,
                        bucket: this.bucket,
                        accessKey: this.accessKey,
                        secretKey: this.secretKey,
                        fileNamePrefix: ['recordings'],
                    },
                },
            };
            const options = { headers: { Authorization: this.Authorization } };
            const start = await this.httpService.axiosRef.post(url, body, options);
            return start.data;
        }
        catch (error) {
            console.log(error);
        }
    }
    async stopRecording(resourceId, cname, sid) {
        try {
            const url = `https://api.agora.io/v1/apps/${this.appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
            const body = { cname, uid: this.uid, clientRequest: {} };
            const options = { headers: { Authorization: this.Authorization } };
            const stop = await this.httpService.axiosRef.post(url, body, options);
            return stop.data;
        }
        catch (error) {
            console.log(error);
        }
    }
};
BroadcastService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(broadcast_schema_1.Broadcast.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService,
        axios_1.HttpService])
], BroadcastService);
exports.BroadcastService = BroadcastService;
//# sourceMappingURL=broadcast.service.js.map