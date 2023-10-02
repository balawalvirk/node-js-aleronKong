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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
let FileService = class FileService {
    constructor(configService) {
        this.configService = configService;
        this.s3 = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
                secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
            },
            region: this.configService.get('AWS_REGION'),
        });
        this.bucket = this.configService.get('S3_BUCKET_NAME');
    }
    getRandomFileName() {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const random = ('' + Math.random()).substring(2, 8);
        const random_number = timestamp + random;
        return random_number;
    }
    async upload(file) {
        const Key = this.getRandomFileName();
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: Key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        await this.s3.send(command);
        return Key;
    }
    async delete(Key) {
        const command = new client_s3_1.DeleteObjectCommand({ Key: Key, Bucket: this.bucket });
        await this.s3.send(command);
    }
};
FileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileService);
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map