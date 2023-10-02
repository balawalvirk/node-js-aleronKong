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
exports.PageInvitationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const invitation_schema_1 = require("./invitation.schema");
let PageInvitationService = class PageInvitationService extends base_service_1.BaseService {
    constructor(pageInvitationModel) {
        super(pageInvitationModel);
        this.pageInvitationModel = pageInvitationModel;
    }
    getPopulateFields() {
        return [{ path: 'page' }, { path: 'friend', select: 'firstName lastName avatar fcmToken' }];
    }
    async create(query) {
        return await (await this.pageInvitationModel.create(query)).populate(this.getPopulateFields());
    }
    async find(filter) {
        return await this.pageInvitationModel.find(filter).populate(this.getPopulateFields());
    }
    async findOneAndUpdate(query, updateQuery) {
        return await this.pageInvitationModel.findOneAndUpdate(query, updateQuery, { new: true }).populate(this.getPopulateFields());
    }
    async findOne(query) {
        return await this.pageInvitationModel.findOne(query).populate(this.getPopulateFields());
    }
};
PageInvitationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invitation_schema_1.PageInvitation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PageInvitationService);
exports.PageInvitationService = PageInvitationService;
//# sourceMappingURL=invitation.service.js.map