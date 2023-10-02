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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const helpers_1 = require("../helpers");
const order_service_1 = require("../order/order.service");
const product_service_1 = require("../product/product.service");
const sale_service_1 = require("../product/sale.service");
let DashboardController = class DashboardController {
    constructor(productService, orderService, saleService) {
        this.productService = productService;
        this.orderService = orderService;
        this.saleService = saleService;
    }
    async SellerDashbaord(user) {
        const options = { sort: { createdAt: -1 }, limit: 10 };
        const [recentProducts, recentOrders, recentCustomers, totalProducts, totalOrders, totalCustomers] = await Promise.all([
            this.productService.find({ creator: user._id }, options),
            this.orderService.find({ seller: user._id }, options),
            this.saleService.findAllRecords({ seller: user._id }, options),
            this.productService.countRecords({ creator: user._id }),
            this.orderService.countRecords({ seller: user._id }),
            this.saleService.findAllRecords({ seller: user._id }),
        ]);
        return { totalCustomers: totalCustomers.length, totalOrders, totalProducts, recentProducts, recentCustomers, recentOrders };
    }
};
__decorate([
    (0, common_1.Get)('user/dashboard'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "SellerDashbaord", null);
DashboardController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        order_service_1.OrderService,
        sale_service_1.SaleService])
], DashboardController);
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map