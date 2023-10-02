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
exports.FundSchema = exports.Fund = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const users_schema_1 = require("../users/users.schema");
const fundraising_schema_1 = require("./fundraising.schema");
let Fund = class Fund {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Fundraising' }),
    __metadata("design:type", fundraising_schema_1.Fundraising)
], Fund.prototype, "project", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", users_schema_1.User)
], Fund.prototype, "donator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", users_schema_1.User)
], Fund.prototype, "beneficiary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Fund.prototype, "price", void 0);
Fund = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Fund);
exports.Fund = Fund;
exports.FundSchema = mongoose_1.SchemaFactory.createForClass(Fund);
//# sourceMappingURL=fund.schema.js.map