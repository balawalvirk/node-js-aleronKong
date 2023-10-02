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
exports.NotificationSchema = exports.Notification = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const group_schema_1 = require("../group/group.schema");
const order_schema_1 = require("../order/order.schema");
const comment_schema_1 = require("../posts/comment.schema");
const posts_schema_1 = require("../posts/posts.schema");
const product_schema_1 = require("../product/product.schema");
const types_1 = require("../types");
const users_schema_1 = require("../users/users.schema");
const page_schema_1 = require("../page/page.schema");
const invitation_schema_1 = require("../page/invitation.schema");
let Notification = class Notification {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", users_schema_1.User)
], Notification.prototype, "sender", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", users_schema_1.User)
], Notification.prototype, "receiver", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }),
    __metadata("design:type", page_schema_1.Page)
], Notification.prototype, "page", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.NotificationType }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }),
    __metadata("design:type", posts_schema_1.Posts)
], Notification.prototype, "post", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'PageInvitation' }),
    __metadata("design:type", invitation_schema_1.PageInvitation)
], Notification.prototype, "invitation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", users_schema_1.User)
], Notification.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }),
    __metadata("design:type", order_schema_1.Order)
], Notification.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }),
    __metadata("design:type", product_schema_1.Product)
], Notification.prototype, "product", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }),
    __metadata("design:type", group_schema_1.Group)
], Notification.prototype, "group", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }),
    __metadata("design:type", comment_schema_1.Comment)
], Notification.prototype, "comment", void 0);
Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.Notification = Notification;
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
//# sourceMappingURL=notification.schema.js.map