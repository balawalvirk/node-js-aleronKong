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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const helpers_1 = require("../helpers");
const create_payment_methord_dto_1 = require("./dto/create-payment-methord.dto");
const update_payment_methord_dto_1 = require("./dto/update-payment-methord.dto");
let PaymentController = class PaymentController {
    constructor(stripeService) {
        this.stripeService = stripeService;
    }
    async createPaymentMethord(createPaymentMethordDto, user) {
        const paymentMethod = await this.stripeService.createPaymentMethod({
            type: 'card',
            card: {
                number: createPaymentMethordDto.number,
                exp_month: createPaymentMethordDto.expiryMonth,
                exp_year: createPaymentMethordDto.expiryYear,
                cvc: createPaymentMethordDto.cvc,
            },
            billing_details: {
                name: createPaymentMethordDto.name,
            },
        });
        return await this.stripeService.attachPaymentMethord(paymentMethod.id, {
            customer: user.customerId,
        });
    }
    async updatePaymentMethord(id, updatePaymentMethordDto) {
        return await this.stripeService.updatePaymentMethord(id, {
            billing_details: {
                name: updatePaymentMethordDto.name,
            },
            card: {
                exp_month: updatePaymentMethordDto.expiryMonth,
                exp_year: updatePaymentMethordDto.expiryYear,
            },
        });
    }
    async defaultPaymentMethord(id, user) {
        await this.stripeService.updateCustomer(user.customerId, {
            invoice_settings: { default_payment_method: id },
        });
        return await this.stripeService.updatePaymentMethord(id, { metadata: { isDefault: 'yes' } });
    }
    async deletePaymentMethord(id) {
        return await this.stripeService.deAttachPaymentMethord(id);
    }
    async findAllPaymentMethords(user) {
        const paymentMethods = await this.stripeService.findAllPaymentMethords(user.customerId, {
            type: 'card',
        });
        return paymentMethods.data;
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_methord_dto_1.CreatePaymentMethordDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentMethord", null);
__decorate([
    (0, common_1.Patch)(':id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_methord_dto_1.UpdatePaymentMethordDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updatePaymentMethord", null);
__decorate([
    (0, common_1.Patch)(':id/default'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "defaultPaymentMethord", null);
__decorate([
    (0, common_1.Delete)(':id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "deletePaymentMethord", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findAllPaymentMethords", null);
PaymentController = __decorate([
    (0, common_1.Controller)('payment-method'),
    __metadata("design:paramtypes", [helpers_1.StripeService])
], PaymentController);
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map