"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
let SubscriptionService = class SubscriptionService {
    create(createSubscriptionDto) {
        return 'This action adds a new subscription';
    }
    findAll() {
        return `This action returns all subscription`;
    }
    findOne(id) {
        return `This action returns a #${id} subscription`;
    }
    update(id, updateSubscriptionDto) {
        return `This action updates a #${id} subscription`;
    }
    remove(id) {
        return `This action removes a #${id} subscription`;
    }
};
SubscriptionService = __decorate([
    (0, common_1.Injectable)()
], SubscriptionService);
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscription.service.js.map