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
exports.PageModeratorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const moderator_schema_1 = require("./moderator.schema");
let PageModeratorService = class PageModeratorService extends base_service_1.BaseService {
    constructor(moderatorModel) {
        super(moderatorModel);
        this.moderatorModel = moderatorModel;
    }
    async create(data) {
        return (await this.moderatorModel.create(data)).populate({ path: 'user', select: 'avatar firstName lastName' });
    }
    async find(query) {
        return await this.moderatorModel.find(query).populate({ path: 'user', select: 'avatar firstName lastName' });
    }
};
PageModeratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(moderator_schema_1.PageModerator.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PageModeratorService);
exports.PageModeratorService = PageModeratorService;
//# sourceMappingURL=moderator.service.js.map