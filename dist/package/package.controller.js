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
exports.PackageController = void 0;
const common_1 = require("@nestjs/common");
const package_service_1 = require("./package.service");
const create_package_dto_1 = require("./dto/create-package.dto");
const update_package_dto_1 = require("./dto/update-package.dto");
const helpers_1 = require("../helpers");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PackageController = class PackageController {
    constructor(packageService, stripeService) {
        this.packageService = packageService;
        this.stripeService = stripeService;
    }
    async create(createPackageDto, user) {
        const product = await this.stripeService.createProduct({
            name: createPackageDto.title,
            description: createPackageDto.description,
            images: [createPackageDto.media],
        });
        const price = await this.stripeService.createPrice({
            currency: 'usd',
            unit_amount: createPackageDto.price * 100,
            recurring: { interval: 'month' },
            product: product.id,
        });
        return await this.packageService.createRecord(Object.assign(Object.assign({}, createPackageDto), { creator: user._id, priceId: price.id, productId: product.id }));
    }
    async findAll(user) {
        return await this.packageService.findAllRecords({ creator: user._id });
    }
    async update(id, updatePackageDto, user) {
        const packageFound = await this.packageService.findOneRecord({ _id: id });
        if (packageFound.price === updatePackageDto.price) {
            await this.stripeService.updateProduct(packageFound.productId, {
                name: updatePackageDto.title,
                description: updatePackageDto.description,
                images: [updatePackageDto.media],
            });
            return await this.packageService.findOneRecordAndUpdate({ _id: packageFound._id }, updatePackageDto);
        }
        else {
            await this.stripeService.updatePrice(packageFound.priceId, {
                active: false,
            });
            const product = await this.stripeService.updateProduct(packageFound.productId, {
                name: updatePackageDto.title,
                description: updatePackageDto.description,
                images: [updatePackageDto.media],
            });
            const price = await this.stripeService.createPrice({
                currency: 'usd',
                unit_amount: updatePackageDto.price * 100,
                recurring: { interval: 'month' },
                nickname: `Monthly subscription for package ${product.name}.`,
                product: product.id,
            });
            return await this.packageService.findOneRecordAndUpdate({ _id: packageFound._id }, Object.assign(Object.assign({}, updatePackageDto), { priceId: price.id }));
        }
    }
    async subscribe(user, id) {
        const pkg = await this.packageService
            .findOneRecord({ _id: id })
            .populate({ path: 'creator', select: 'accountId' });
        await this.stripeService.createSubscription({
            customer: user.customerId,
            items: [{ price: pkg.priceId }],
            currency: 'usd',
            transfer_data: {
                destination: pkg.creator.accountId,
            },
        });
        return await this.packageService.findOneRecordAndUpdate({ _id: id }, { $push: { buyers: user._id } });
    }
    async remove(id) {
        const pkg = await this.packageService.findOneRecord({ _id: id });
        await this.stripeService.updateProduct(pkg.productId, { active: false });
        await this.stripeService.updatePrice(pkg.priceId, { active: false });
        const subscriptions = await this.stripeService.findAllSubscriptions({
            price: pkg.priceId,
        });
        for (const subscription of subscriptions.data) {
            await this.stripeService.cancelSubscription(subscription.id);
        }
        return await this.packageService.deleteSingleRecord({ _id: id });
    }
    async findAllAuthors(user) {
        return await this.packageService.findAllAuthors(user._id);
    }
    async unSubscribePackage(id, user) {
        const pkg = await this.packageService.findOneRecord({ _id: id });
        if (pkg) {
            const subscription = await this.stripeService.findAllSubscriptions({
                customer: user._id,
                price: pkg.priceId,
            });
            await this.stripeService.cancelSubscription(subscription.data[0].id);
            await this.packageService.findOneRecordAndUpdate({ _id: id }, { $pull: { buyers: user._id } });
            return 'Subscription canceled successfully.';
        }
        throw new common_1.BadRequestException('Package not found');
    }
    async findOne(id) {
        return await this.packageService.findOneRecord({ _id: id });
    }
    async findMembership(user) {
        const priceId = 'price_1M1PKmLyEqAWCXHoxHWq7yYw';
        const subscriptions = await this.stripeService.findAllSubscriptions({
            customer: user.customerId,
            price: priceId,
        });
        const invoices = await this.stripeService.findAllInvoices({
            subscription: subscriptions.data[0].id,
        });
        const desiredInvoices = invoices.data.map((invoice) => ({
            id: invoice.id,
            created: invoice.created,
            amount_paid: invoice.amount_paid,
        }));
        return {
            subscription: {
                id: subscriptions.data[0].id,
                current_period_end: subscriptions.data[0].current_period_end,
            },
            invoices: desiredInvoices,
        };
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_package_dto_1.CreatePackageDto, Object]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_package_dto_1.UpdatePackageDto, Object]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('subscribe/:id'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('author/find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "findAllAuthors", null);
__decorate([
    (0, common_1.Patch)('unsubscribe/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "unSubscribePackage", null);
__decorate([
    (0, common_1.Get)('find-one/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('membership'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "findMembership", null);
PackageController = __decorate([
    (0, common_1.Controller)('package'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [package_service_1.PackageService,
        helpers_1.StripeService])
], PackageController);
exports.PackageController = PackageController;
//# sourceMappingURL=package.controller.js.map