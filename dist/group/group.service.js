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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const types_1 = require("../types");
const group_schema_1 = require("./group.schema");
let GroupService = class GroupService extends base_service_1.BaseService {
    constructor(groupModel) {
        super(groupModel);
        this.groupModel = groupModel;
    }
    async findAllMembers(query) {
        return await this.groupModel.findOne(query).populate({ path: 'members.member', select: 'firstName lastName avatar' }).select('members -_id');
    }
    async findAllRequests(query) {
        return await this.groupModel.findOne(query).populate({ path: 'requests', select: 'firstName lastName avatar' }).select('-_id requests');
    }
    async isGroupMuted(mute) {
        if (mute) {
            const today = new Date();
            if (mute.interval === types_1.MuteInterval.DAY || types_1.MuteInterval.WEEK) {
                if (mute.date.getTime() < today.getTime())
                    return false;
                else
                    return true;
            }
            else {
                if (today.getTime() <= mute.startTime.getTime() && today.getTime() >= mute.endTime.getTime())
                    return false;
                else
                    return true;
            }
        }
        else
            return false;
    }
};
GroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(group_schema_1.Group.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GroupService);
exports.GroupService = GroupService;
//# sourceMappingURL=group.service.js.map