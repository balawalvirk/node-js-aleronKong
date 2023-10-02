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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const update_order_dto_1 = require("./dto/update-order.dto");
const helpers_1 = require("../helpers");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const types_1 = require("../types");
const find_all_query_dto_1 = require("./dto/find-all-query.dto");
const review_service_1 = require("../review/review.service");
let OrderController = class OrderController {
    constructor(orderService, stripeService, reviewService) {
        this.orderService = orderService;
        this.stripeService = stripeService;
        this.reviewService = reviewService;
    }
    async findAll(_a) {
        var { page, limit } = _a, rest = __rest(_a, ["page", "limit"]);
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const orders = await this.orderService.find(rest, options);
        const total = await this.orderService.countRecords(rest);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: orders,
        };
        return paginated;
    }
    async findOne(id) {
        const order = await this.orderService.findOne({ _id: id });
        if (!order)
            throw new common_1.HttpException('Order does not exists.', common_1.HttpStatus.BAD_REQUEST);
        const paymentMethod = await this.stripeService.findOnePaymentMethod(order.paymentMethod);
        const subTotal = order.product.price * order.quantity;
        const tax = Math.round((2 / 100) * subTotal);
        const total = subTotal + tax;
        return Object.assign(Object.assign({}, order.toJSON()), { total, tax, subTotal, paymentMethod });
    }
    async update(id, updateOrderDto) {
        const order = await this.orderService.findOneAndUpdate({ _id: id }, updateOrderDto);
        if (order.status === types_1.OrderStatus.COMPLETED) {
            const subTotal = order.product.price * order.quantity;
            const tax = Math.round((2 / 100) * subTotal);
            const total = Math.round((subTotal + tax) * 100);
            const applicationFeeAmount = Math.round((order.product.category.commission / 100) * total);
            const amount = total - applicationFeeAmount;
            await this.stripeService.createTransfer({
                amount,
                currency: 'usd',
                destination: order.product.creator.sellerId,
                transfer_group: order._id,
                description: `${order.product.title} payment transfer.`,
            });
        }
        else if (order.status === types_1.OrderStatus.CANCELED) {
            await this.stripeService.createRefund({ payment_intent: order.paymentIntent });
        }
        return order;
    }
    async delete(id) {
        await this.orderService.deleteSingleRecord({ _id: id });
        return { message: 'Order deleted successfully.' };
    }
    async findReviews(id) {
        return await this.reviewService.find({ order: id });
    }
};
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_query_dto_1.FindAllOrderQueryDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/find-one'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/update'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/review/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findReviews", null);
OrderController = __decorate([
    (0, common_1.Controller)('order'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        helpers_1.StripeService,
        review_service_1.ReviewService])
], OrderController);
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map