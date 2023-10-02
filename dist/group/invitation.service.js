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
exports.GroupInvitationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const invitation_schema_1 = require("./invitation.schema");
let GroupInvitationService = class GroupInvitationService extends base_service_1.BaseService {
    constructor(groupInvitationModel) {
        super(groupInvitationModel);
        this.groupInvitationModel = groupInvitationModel;
    }
    getPopulateFields() {
        return [{ path: 'group' }, { path: 'friend', select: 'firstName lastName avatar fcmToken' }];
    }
    async create(query) {
        return await (await this.groupInvitationModel.create(query)).populate(this.getPopulateFields());
    }
    async find(filter) {
        return await this.groupInvitationModel.find(filter).populate(this.getPopulateFields());
    }
    async findOneAndUpdate(query, updateQuery) {
        return await this.groupInvitationModel.findOneAndUpdate(query, updateQuery, { new: true }).populate(this.getPopulateFields());
    }
    async findOne(query) {
        return await this.groupInvitationModel.findOne(query).populate(this.getPopulateFields());
    }
};
GroupInvitationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invitation_schema_1.GroupInvitation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GroupInvitationService);
exports.GroupInvitationService = GroupInvitationService;
//# sourceMappingURL=invitation.service.js.map