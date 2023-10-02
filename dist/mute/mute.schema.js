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
exports.MuteSchema = exports.Mute = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const chat_schema_1 = require("../chat/chat.schema");
const group_schema_1 = require("../group/group.schema");
const types_1 = require("../types");
const users_schema_1 = require("../users/users.schema");
let Mute = class Mute {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }),
    __metadata("design:type", group_schema_1.Group)
], Mute.prototype, "group", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }),
    __metadata("design:type", chat_schema_1.Chat)
], Mute.prototype, "chat", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", users_schema_1.User)
], Mute.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Mute.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Mute.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Mute.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.MuteInterval, required: true }),
    __metadata("design:type", String)
], Mute.prototype, "interval", void 0);
Mute = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Mute);
exports.Mute = Mute;
exports.MuteSchema = mongoose_1.SchemaFactory.createForClass(Mute);
//# sourceMappingURL=mute.schema.js.map