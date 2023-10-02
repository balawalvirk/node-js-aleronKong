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
exports.PostSchema = exports.Posts = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const fundraising_schema_1 = require("../fundraising/fundraising.schema");
const group_schema_1 = require("../group/group.schema");
const page_schema_1 = require("../page/page.schema");
const types_1 = require("../types");
const users_schema_1 = require("../users/users.schema");
let Posts = class Posts {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Posts.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }),
    __metadata("design:type", Array)
], Posts.prototype, "likes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] }),
    __metadata("design:type", Array)
], Posts.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Posts.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Posts.prototype, "videos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], Posts.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.PostPrivacy, required: true }),
    __metadata("design:type", String)
], Posts.prototype, "privacy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Posts.prototype, "isBlocked", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.PostStatus, default: types_1.PostStatus.ACTIVE }),
    __metadata("design:type", String)
], Posts.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }),
    __metadata("design:type", group_schema_1.Group)
], Posts.prototype, "group", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.PostType, default: types_1.PostType.POST }),
    __metadata("design:type", String)
], Posts.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Fundraising' }),
    __metadata("design:type", fundraising_schema_1.Fundraising)
], Posts.prototype, "fundraising", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Posts.prototype, "pin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Posts.prototype, "featured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }] }),
    __metadata("design:type", Array)
], Posts.prototype, "reactions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }),
    __metadata("design:type", Array)
], Posts.prototype, "tagged", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }),
    __metadata("design:type", Array)
], Posts.prototype, "mentions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Posts.prototype, "gif", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }),
    __metadata("design:type", Posts)
], Posts.prototype, "sharedPost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }),
    __metadata("design:type", page_schema_1.Page)
], Posts.prototype, "page", void 0);
Posts = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Posts);
exports.Posts = Posts;
exports.PostSchema = mongoose_1.SchemaFactory.createForClass(Posts);
//# sourceMappingURL=posts.schema.js.map