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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const cart_schema_1 = require("./cart.schema");
let CartService = class CartService extends base_service_1.BaseService {
    constructor(CartModel) {
        super(CartModel);
        this.CartModel = CartModel;
    }
    calculateTax(items) {
        const subTotal = items.reduce((n, { item, quantity }) => n + item.price * quantity, 0);
        const tax = Math.round((2 / 100) * subTotal);
        const total = subTotal + tax;
        return { subTotal, tax, total };
    }
    async create(data) {
        return (await this.CartModel.create(data)).populate({
            path: 'items.item',
            select: 'media title creator price',
        });
    }
    async findOne(query) {
        return await this.CartModel.findOne(query)
            .populate({
            path: 'items.item',
            select: 'media title creator price',
            populate: { path: 'creator', select: 'fcmToken' },
        })
            .lean();
    }
    async findOneAndUpdate(query, updateQuery) {
        return await this.CartModel.findOneAndUpdate(query, updateQuery, { new: true })
            .populate({
            path: 'items.item',
            select: 'media title creator price',
        })
            .lean();
    }
};
CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CartService);
exports.CartService = CartService;
//# sourceMappingURL=cart.service.js.map