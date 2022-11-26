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
exports.GroupSchema = exports.Group = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const types_1 = require("../types");
const users_schema_1 = require("../users/users.schema");
const member_schema_1 = require("./member.schema");
const report_schema_1 = require("./report.schema");
let Group = class Group {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Group.prototype, "coverPhoto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Group.prototype, "profilePhoto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Group.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], Group.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.GroupPrivacy, required: true }),
    __metadata("design:type", String)
], Group.prototype, "privacy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [member_schema_1.MemberSchema] }),
    __metadata("design:type", Array)
], Group.prototype, "members", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }] }),
    __metadata("design:type", Array)
], Group.prototype, "posts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true }),
    __metadata("design:type", Array)
], Group.prototype, "requests", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [report_schema_1.ReportSchema] }),
    __metadata("design:type", Array)
], Group.prototype, "reports", void 0);
Group = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Group);
exports.Group = Group;
exports.GroupSchema = mongoose_1.SchemaFactory.createForClass(Group);
//# sourceMappingURL=group.schema.js.map