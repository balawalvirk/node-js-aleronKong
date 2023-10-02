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
exports.PackageController = void 0;
const common_1 = require("@nestjs/common");
const package_service_1 = require("./package.service");
const create_package_dto_1 = require("./dto/create-package.dto");
const update_package_dto_1 = require("./dto/update-package.dto");
const helpers_1 = require("../helpers");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const users_service_1 = require("../users/users.service");
const types_1 = require("../types");
const find_all_query_dto_1 = require("./dto/find-all-query.dto");
const notification_service_1 = require("../notification/notification.service");
const firebase_service_1 = require("../firebase/firebase.service");
let PackageController = class PackageController {
    constructor(packageService, stripeService, userService, notificationService, firebaseService) {
        this.packageService = packageService;
        this.stripeService = stripeService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.firebaseService = firebaseService;
    }
    async create(createPackageDto, user) {
        if (createPackageDto.isGuildPackage) {
            if (!user.role.includes(types_1.UserRoles.ADMIN))
                throw new common_1.HttpException('Forbidden resource', common_1.HttpStatus.FORBIDDEN);
        }
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
    async findAllPackages(_a) {
        var { page, limit, query } = _a, rest = __rest(_a, ["page", "limit", "query"]);
        const $q = (0, helpers_1.makeQuery)({ page: page, limit: limit });
        const rjx = { $regex: query ? query : '', $options: 'i' };
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const condition = Object.assign(Object.assign({}, rest), { title: rjx });
        const total = await this.packageService.countRecords(condition);
        const packages = await this.packageService.findAllRecords(condition, options);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: packages,
        };
        return paginated;
    }
    async update(id, updatePackageDto, user) {
        const packageFound = await this.packageService.findOneRecord({ _id: id });
        if (packageFound.isGuildPackage) {
            if (!user.role.includes(types_1.UserRoles.ADMIN))
                throw new common_1.HttpException('Forbidden resource', common_1.HttpStatus.FORBIDDEN);
        }
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
        const pkg = await this.packageService.findOneRecord({ _id: id }).populate({ path: 'creator', select: 'sellerId fcmToken' });
        if (!pkg)
            throw new common_1.BadRequestException('Package does not exists.');
        const pkgExists = pkg.buyers.find((buyer) => buyer == user._id);
        if (pkgExists)
            throw new common_1.HttpException('You are already subscriber of this package.', common_1.HttpStatus.BAD_REQUEST);
        if (!pkg.isGuildPackage) {
            const userFound = await this.userService.findOneRecord({ _id: user._id }).populate({ path: 'supportingPackages', select: 'creator' });
            const authorFound = userFound.supportingPackages.find((supportingPackage) => supportingPackage.creator == pkg.creator._id);
            if (authorFound)
                throw new common_1.HttpException('You already subscribed to one of the packages of this owner.', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.stripeService.createSubscription({
            customer: user.customerId,
            items: [{ price: pkg.priceId }],
            currency: 'usd',
            transfer_data: {
                destination: pkg.creator.sellerId,
            },
        });
        if (pkg.isGuildPackage) {
            await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { supportingPackages: pkg._id }, isGuildMember: true });
        }
        else {
            await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { supportingPackages: pkg._id } });
        }
        if (!pkg.isGuildPackage) {
            await this.notificationService.createRecord({
                user: user._id,
                sender: user._id,
                receiver: pkg.creator._id,
                message: `subscribed your package.`,
                type: types_1.NotificationType.USER_SUPPORTING,
            });
            await this.firebaseService.sendNotification({
                token: pkg.creator.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} subscribed your package.` },
                data: { user: user._id.toString(), type: types_1.NotificationType.USER_SUPPORTING },
            });
        }
        return await this.packageService.findOneRecordAndUpdate({ _id: id }, { $push: { buyers: user._id } });
    }
    async remove(id, user) {
        const pkg = await this.packageService.findOneRecord({ _id: id });
        if (pkg.isGuildPackage) {
            if (!user.role.includes(types_1.UserRoles.ADMIN))
                throw new common_1.HttpException('Forbidden resource', common_1.HttpStatus.FORBIDDEN);
        }
        await this.stripeService.updateProduct(pkg.productId, { active: false });
        await this.stripeService.updatePrice(pkg.priceId, { active: false });
        const subscriptions = await this.stripeService.findAllSubscriptions({
            price: pkg.priceId,
        });
        for (const subscription of subscriptions.data) {
            await this.stripeService.cancelSubscription(subscription.id);
        }
        await this.userService.updateManyRecords({ supportingPackages: { $in: [pkg._id] } }, { $pull: { supportingPackages: pkg._id } });
        return await this.packageService.deleteSingleRecord({ _id: id });
    }
    async findAllAuthors(user) {
        return await this.packageService.findAllAuthors(user._id);
    }
    async unSubscribePackage(id, user) {
        const pkg = await this.packageService.findOneRecord({ _id: id });
        if (!pkg)
            throw new common_1.HttpException('Package not found', common_1.HttpStatus.BAD_REQUEST);
        const pkgExists = user.supportingPackages.find((pkg) => pkg.equals(id));
        if (!pkgExists)
            throw new common_1.HttpException('You are not subscriber of this package.', common_1.HttpStatus.BAD_REQUEST);
        const subscriptions = await this.stripeService.findAllSubscriptions({
            customer: user._id,
            price: pkg.priceId,
        });
        await this.stripeService.cancelSubscription(subscriptions.data[0].id);
        if (pkg.isGuildPackage) {
            await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { supportingPackages: pkg._id }, isGuildMember: false });
        }
        else {
            await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { supportingPackages: pkg._id } });
        }
        await this.packageService.findOneRecordAndUpdate({ _id: id }, { $pull: { buyers: user._id } });
        return 'Subscription cancelled successfully.';
    }
    async findOne(id) {
        return await this.packageService.findOneRecord({ _id: id });
    }
    async findMembership(user, id) {
        const pkg = await this.packageService.findOneRecord({ _id: id }).lean();
        if (!pkg)
            throw new common_1.HttpException('Package does not exists.', common_1.HttpStatus.BAD_REQUEST);
        const subscriptions = await this.stripeService.findAllSubscriptions({
            customer: user.customerId,
            price: pkg.priceId,
        });
        if (subscriptions.data.length === 0)
            throw new common_1.HttpException('There is no active subscription of this item.', common_1.HttpStatus.BAD_REQUEST);
        const allInvoices = await this.stripeService.findAllInvoices({
            subscription: subscriptions.data[0].id,
            customer: user.customerId,
        });
        const invoices = allInvoices.data.map((invoice) => ({ created: invoice.created, amountPaid: invoice.amount_paid }));
        return Object.assign(Object.assign({}, pkg), { invoices, nextPaymentDuo: subscriptions.data[0].current_period_end });
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
    (0, common_1.Get)('/find-all'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_query_dto_1.FindAllPackagesQueryDto]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "findAllPackages", null);
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
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
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
    (0, common_1.Get)(':id/payment-history'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PackageController.prototype, "findMembership", null);
PackageController = __decorate([
    (0, common_1.Controller)('package'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [package_service_1.PackageService,
        helpers_1.StripeService,
        users_service_1.UsersService,
        notification_service_1.NotificationService,
        firebase_service_1.FirebaseService])
], PackageController);
exports.PackageController = PackageController;
//# sourceMappingURL=package.controller.js.map