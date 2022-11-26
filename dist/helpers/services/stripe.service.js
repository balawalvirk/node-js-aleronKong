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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeService = class StripeService {
    constructor(configService) {
        this.configService = configService;
        this.stripe = new stripe_1.default.Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2022-08-01',
        });
    }
    async createCustomer(body) {
        return await this.stripe.customers.create({
            email: body.email,
        });
    }
    async updateCustomer(id, params, options) {
        return await this.stripe.customers.update(id, params, options);
    }
    async findOneCustomer(id) {
        return await this.stripe.customers.retrieve(id);
    }
    async createPaymentMethod(body) {
        return await this.stripe.paymentMethods.create(body);
    }
    async attachPaymentMethord(paymentMethodId, params) {
        return await this.stripe.paymentMethods.attach(paymentMethodId, params);
    }
    async findAllPaymentMethords(customerId, params) {
        return await this.stripe.customers.listPaymentMethods(customerId, params);
    }
    async findOnePaymentMethod(id) {
        return await this.stripe.paymentMethods.retrieve(id);
    }
    async deAttachPaymentMethord(paymentMethodId) {
        return await this.stripe.paymentMethods.detach(paymentMethodId);
    }
    async updatePaymentMethord(paymentMethodId, params) {
        return await this.stripe.paymentMethods.update(paymentMethodId, params);
    }
    async createPaymentIntent(params, options) {
        return await this.stripe.paymentIntents.create(params, options);
    }
    async createProduct(params, options) {
        return await this.stripe.products.create(params, options);
    }
    async updateProduct(id, params, options) {
        return await this.stripe.products.update(id, params, options);
    }
    async findOneProduct(id, params, options) {
        return await this.stripe.products.retrieve(id, params, options);
    }
    async createPrice(params, options) {
        return await this.stripe.prices.create(params, options);
    }
    async updatePrice(id, params, options) {
        return await this.stripe.prices.update(id, params, options);
    }
    async createSubscription(params, options) {
        return await this.stripe.subscriptions.create(params, options);
    }
    async findAllSubscriptions(params, options) {
        return await this.stripe.subscriptions.list(params, options);
    }
    async findOneSubscription(id, params, options) {
        return await this.stripe.subscriptions.retrieve(id, params, options);
    }
    async cancelSubscription(id, params, options) {
        return await this.stripe.subscriptions.del(id, params, options);
    }
    async findAllInvoices(params, options) {
        return await this.stripe.invoices.list(params, options);
    }
    async createAccount(params, options) {
        return await this.stripe.accounts.create(params, options);
    }
    async updateAccount(id, params, options) {
        return await this.stripe.accounts.update(id, params, options);
    }
    async deleteAccount(id, params, options) {
        return await this.stripe.accounts.del(id, params, options);
    }
    async createTransfer(params, options) {
        return await this.stripe.transfers.create(params, options);
    }
};
StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
exports.StripeService = StripeService;
//# sourceMappingURL=stripe.service.js.map