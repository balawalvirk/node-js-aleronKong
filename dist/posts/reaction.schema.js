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
exports.ReactionSchema = exports.Reaction = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const users_schema_1 = require("../users/users.schema");
const comment_schema_1 = require("./comment.schema");
const posts_schema_1 = require("./posts.schema");
let Reaction = class Reaction {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Reaction.prototype, "emoji", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], Reaction.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }),
    __metadata("design:type", posts_schema_1.Posts)
], Reaction.prototype, "post", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }),
    __metadata("design:type", comment_schema_1.Comment)
], Reaction.prototype, "comment", void 0);
Reaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Reaction);
exports.Reaction = Reaction;
exports.ReactionSchema = mongoose_1.SchemaFactory.createForClass(Reaction);
//# sourceMappingURL=reaction.schema.js.map