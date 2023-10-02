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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const helpers_1 = require("../helpers");
const order_schema_1 = require("./order.schema");
let OrderService = class OrderService extends helpers_1.BaseService {
    constructor(OrderModel) {
        super(OrderModel);
        this.OrderModel = OrderModel;
    }
    getOrderNumber() {
        return Math.floor(100000 + Math.random() * 900000);
    }
    async find(query, options) {
        return await this.OrderModel.find(query, {}, options).populate([{ path: 'product', select: 'media title creator price' }, { path: 'customer' }]);
    }
    async findOne(query) {
        return await this.OrderModel.findOne(query).populate([
            {
                path: 'product',
                select: 'media title creator price',
                populate: [{ path: 'creator', select: 'sellerId' }],
            },
            { path: 'address' },
            { path: 'customer' },
        ]);
    }
    async findOneAndUpdate(query, updateQuery) {
        return await this.OrderModel.findOneAndUpdate(query, updateQuery, { new: true }).populate([
            {
                path: 'product',
                select: 'media title creator price',
                populate: [{ path: 'creator', select: 'sellerId' }, { path: 'category' }],
            },
            { path: 'customer', select: 'firstName lastName avatar email' },
            { path: 'address' },
        ]);
    }
};
OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OrderService);
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map