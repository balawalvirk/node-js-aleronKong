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
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const file_service_1 = require("./file.service");
const helpers_1 = require("../helpers");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FileController = class FileController {
    constructor(fileService) {
        this.fileService = fileService;
    }
    async create(file, host, isPrivate) {
        const s3Object = await this.fileService.upload(file, isPrivate === true ? true : false);
        return { fileUrl: `${host}/v1/file/find-one/${s3Object.Key}` };
    }
    async findOne(key) {
        const file = this.fileService.download(key);
        return { file: new common_1.StreamableFile(file) };
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(helpers_1.UploadGuard),
    __param(0, (0, helpers_1.File)()),
    __param(1, (0, common_1.Headers)('host')),
    __param(2, (0, common_1.Body)('isPrivate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('find-one/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "findOne", null);
FileController = __decorate([
    (0, common_1.Controller)('file'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
exports.FileController = FileController;
//# sourceMappingURL=file.controller.js.map