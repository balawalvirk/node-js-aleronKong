"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodModule = void 0;
const common_1 = require("@nestjs/common");
const payment_method_controller_1 = require("./payment-method.controller");
const helpers_1 = require("../helpers");
const users_module_1 = require("../users/users.module");
let PaymentMethodModule = class PaymentMethodModule {
};
PaymentMethodModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [payment_method_controller_1.PaymentMethodController],
        providers: [helpers_1.StripeService],
    })
], PaymentMethodModule);
exports.PaymentMethodModule = PaymentMethodModule;
//# sourceMappingURL=payment-method.module.js.map