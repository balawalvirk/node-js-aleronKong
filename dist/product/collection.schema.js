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
exports.CollectionSchema = exports.Collection = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const types_1 = require("../types");
let Collection = class Collection {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Collection.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Collection.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [String] }),
    __metadata("design:type", Array)
], Collection.prototype, "media", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [String] }),
    __metadata("design:type", Array)
], Collection.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.CollectionTypes, required: true }),
    __metadata("design:type", String)
], Collection.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: types_1.CollectionConditions, required: true }),
    __metadata("design:type", String)
], Collection.prototype, "conditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] }),
    __metadata("design:type", Array)
], Collection.prototype, "products", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", Array)
], Collection.prototype, "creator", void 0);
Collection = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Collection);
exports.Collection = Collection;
exports.CollectionSchema = mongoose_1.SchemaFactory.createForClass(Collection);
//# sourceMappingURL=collection.schema.js.map