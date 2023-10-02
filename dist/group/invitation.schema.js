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
exports.GroupInvitationSchema = exports.GroupInvitation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const types_1 = require("../types");
const users_schema_1 = require("../users/users.schema");
const group_schema_1 = require("./group.schema");
let GroupInvitation = class GroupInvitation {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Group', required: true }),
    __metadata("design:type", group_schema_1.Group)
], GroupInvitation.prototype, "group", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], GroupInvitation.prototype, "friend", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], GroupInvitation.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.GroupInvitationStatus, default: types_1.GroupInvitationStatus.PENDING }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "status", void 0);
GroupInvitation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GroupInvitation);
exports.GroupInvitation = GroupInvitation;
exports.GroupInvitationSchema = mongoose_1.SchemaFactory.createForClass(GroupInvitation);
//# sourceMappingURL=invitation.schema.js.map