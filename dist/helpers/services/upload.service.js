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
exports.FileUploadService = void 0;
const aws_sdk_1 = require("aws-sdk");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let FileUploadService = class FileUploadService {
    constructor(configService) {
        this.configService = configService;
        this.s3 = new aws_sdk_1.S3({
            accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
            secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
            region: this.configService.get('AWS_REGION'),
        });
    }
    async upload(file) {
        return await this.s3
            .upload({
            Bucket: this.configService.get('S3_BUCKET_NAME'),
            Key: file.filename,
            Body: file.file,
        })
            .promise();
    }
    async download() {
        await this.s3.getObject().promise();
    }
};
FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileUploadService);
exports.FileUploadService = FileUploadService;
//# sourceMappingURL=upload.service.js.map