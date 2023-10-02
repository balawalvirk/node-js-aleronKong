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
exports.PageSchema = exports.Page = exports.Follower = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const users_schema_1 = require("../users/users.schema");
let Follower = class Follower {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], Follower.prototype, "follower", void 0);
__decorate([
    (0, mongoose_1.Prop)({ dafault: false }),
    __metadata("design:type", Boolean)
], Follower.prototype, "banned", void 0);
Follower = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, versionKey: false, _id: false })
], Follower);
exports.Follower = Follower;
const FollowerSchema = mongoose_1.SchemaFactory.createForClass(Follower);
let Page = class Page {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Page.prototype, "coverPhoto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Page.prototype, "profilePhoto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Page.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Page.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], Page.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [FollowerSchema] }),
    __metadata("design:type", Array)
], Page.prototype, "followers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }] }),
    __metadata("design:type", Array)
], Page.prototype, "posts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true }),
    __metadata("design:type", Array)
], Page.prototype, "requests", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Moderator' }], required: true }),
    __metadata("design:type", Array)
], Page.prototype, "moderators", void 0);
Page = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Page);
exports.Page = Page;
exports.PageSchema = mongoose_1.SchemaFactory.createForClass(Page);
//# sourceMappingURL=page.schema.js.map