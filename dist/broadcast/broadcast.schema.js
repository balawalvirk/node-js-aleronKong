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
exports.BroadcastSchema = exports.Broadcast = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const users_schema_1 = require("../users/users.schema");
let Recording = class Recording {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recording.prototype, "sid", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recording.prototype, "resourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recording.prototype, "uid", void 0);
Recording = __decorate([
    (0, mongoose_1.Schema)({ timestamps: false, versionKey: false })
], Recording);
let Broadcast = class Broadcast {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Broadcast.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Broadcast.prototype, "token", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", users_schema_1.User)
], Broadcast.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Recording }),
    __metadata("design:type", Recording)
], Broadcast.prototype, "recording", void 0);
Broadcast = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Broadcast);
exports.Broadcast = Broadcast;
exports.BroadcastSchema = mongoose_1.SchemaFactory.createForClass(Broadcast);
//# sourceMappingURL=broadcast.schema.js.map