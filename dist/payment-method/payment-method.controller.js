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
exports.PaymentMethodController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const helpers_1 = require("../helpers");
const users_service_1 = require("../users/users.service");
const create_payment_methord_dto_1 = require("./dto/create-payment-methord.dto");
const update_payment_methord_dto_1 = require("./dto/update-payment-methord.dto");
let PaymentMethodController = class PaymentMethodController {
    constructor(stripeService, userService) {
        this.stripeService = stripeService;
        this.userService = userService;
    }
    async createPaymentMethord({ number, expiryMonth, expiryYear, name, cvc }, user) {
        const paymentMethod = await this.stripeService.createPaymentMethod({
            type: 'card',
            card: {
                number: number,
                exp_month: expiryMonth,
                exp_year: expiryYear,
                cvc: cvc,
            },
            billing_details: {
                name,
            },
        });
        const methodAttached = await this.stripeService.attachPaymentMethord(paymentMethod.id, {
            customer: user.customerId,
        });
        if (!user.defaultPaymentMethod) {
            await this.stripeService.updateCustomer(user.customerId, { invoice_settings: { default_payment_method: paymentMethod.id } });
            await this.userService.findOneRecordAndUpdate({ _id: user._id }, { defaultPaymentMethod: paymentMethod.id });
        }
        return methodAttached;
    }
    async updatePaymentMethord(id, { name, expiryMonth, expiryYear }) {
        return await this.stripeService.updatePaymentMethord(id, {
            billing_details: {
                name: name,
            },
            card: {
                exp_month: expiryMonth,
                exp_year: expiryYear,
            },
        });
    }
    async defaultPaymentMethord(id, user) {
        await this.stripeService.updateCustomer(user.customerId, {
            invoice_settings: { default_payment_method: id },
        });
        await this.userService.findOneRecordAndUpdate({ _id: user._id }, { defaultPaymentMethod: id });
        return 'Default payment method added to customer account.';
    }
    async deletePaymentMethord(id, user) {
        const paymentMethod = await this.stripeService.deAttachPaymentMethord(id);
        const paymentMethods = await this.stripeService.findAllPaymentMethords(user.customerId, { type: 'card' });
        if (paymentMethods.data.length === 0)
            await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $unset: { defaultPaymentMethod: 1 } });
        return paymentMethod;
    }
    async findAllPaymentMethords(user) {
        const paymentMethods = await this.stripeService.findAllPaymentMethords(user.customerId, { type: 'card' });
        return paymentMethods.data;
    }
    async findOnePaymentMethord(id) {
        return await this.stripeService.findOnePaymentMethod(id);
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_methord_dto_1.CreatePaymentMethordDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentMethodController.prototype, "createPaymentMethord", null);
__decorate([
    (0, common_1.Patch)(':id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_methord_dto_1.UpdatePaymentMethordDto]),
    __metadata("design:returntype", Promise)
], PaymentMethodController.prototype, "updatePaymentMethord", null);
__decorate([
    (0, common_1.Patch)(':id/default'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentMethodController.prototype, "defaultPaymentMethord", null);
__decorate([
    (0, common_1.Delete)(':id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentMethodController.prototype, "deletePaymentMethord", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentMethodController.prototype, "findAllPaymentMethords", null);
__decorate([
    (0, common_1.Get)(':id/find-one'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentMethodController.prototype, "findOnePaymentMethord", null);
PaymentMethodController = __decorate([
    (0, common_1.Controller)('payment-method'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [helpers_1.StripeService, users_service_1.UsersService])
], PaymentMethodController);
exports.PaymentMethodController = PaymentMethodController;
//# sourceMappingURL=payment-method.controller.js.map