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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const address_service_1 = require("../address/address.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const helpers_1 = require("../helpers");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const types_1 = require("../types");
const collection_service_1 = require("./collection.service");
const add_product_dto_1 = require("./dtos/add-product.dto");
const create_checkout_dto_1 = require("./dtos/create-checkout.dto");
const create_collection_dto_1 = require("./dtos/create-collection.dto");
const create_product_dto_1 = require("./dtos/create-product.dto");
const update_product_dto_1 = require("./dtos/update-product.dto");
const product_service_1 = require("./product.service");
let ProductController = class ProductController {
    constructor(productService, collectionService, stripeService, addressService) {
        this.productService = productService;
        this.collectionService = collectionService;
        this.stripeService = stripeService;
        this.addressService = addressService;
    }
    async create(body, user) {
        return await this.productService.createRecord(Object.assign(Object.assign({}, body), { creator: user._id }));
    }
    async remove(id) {
        const product = await this.productService.deleteSingleRecord({ _id: id });
        await this.collectionService.updateManyRecords({ products: { $in: [product._id] } }, { $pull: { products: product._id } });
        return product;
    }
    async update(id, updateProductDto) {
        return await this.productService.findOneRecordAndUpdate({ _id: id }, updateProductDto);
    }
    async inventory(user) {
        await this.productService.findAllRecords({ creator: user._id });
    }
    async findAll(user, type) {
        let products = [];
        if (type === 'all') {
            products = await this.productService.findAllRecords({ type, creator: user._id });
        }
        products = await this.productService.findAllRecords({ type, creator: user._id });
        return products;
    }
    async checkout({ paymentMethod, address, products }, user) {
        const { city, line1, line2, country, state, postalCode } = await this.addressService.findOneRecord({ _id: address });
        const allProducts = await this.productService
            .findAllRecords({
            _id: { $in: products },
        })
            .populate({ path: 'creator', select: 'accountId' });
        const totalPrice = allProducts.reduce((n, { price }) => n + price, 0);
        const transfer_group = `${Math.floor(Math.random() * 899999 + 100000)}`;
        const paymentIntent = await this.stripeService.createPaymentIntent({
            currency: 'usd',
            payment_method: paymentMethod,
            amount: totalPrice * 100,
            customer: user.customerId,
            shipping: {
                address: {
                    city: city,
                    line1: line1,
                    line2: line2,
                    country: country,
                    state: state,
                    postal_code: postalCode,
                },
                name: `${user.firstName} ${user.lastName}`,
            },
            transfer_group,
            application_fee_amount: 500,
        });
        for (const product of allProducts) {
            await this.stripeService.createTransfer({
                amount: product.price,
                currency: 'usd',
                destination: product.creator.accountId,
                transfer_group,
                description: `${product.title} transfers`,
            });
        }
        return paymentIntent.client_secret;
    }
    async createCollection(createCollectionDto, user) {
        const collection = await this.collectionService.createRecord(Object.assign(Object.assign({}, createCollectionDto), { creator: user._id }));
        let products;
        if (collection.type === types_1.CollectionTypes.AUTOMATED) {
            if (collection.conditions === types_1.CollectionConditions.ANY) {
                products = await this.productService.findAllRecords({ tags: { $in: collection.tags } });
            }
            else if (collection.conditions === types_1.CollectionConditions.All) {
                products = await this.productService.findAllRecords({ tags: { $all: collection.tags } });
            }
            return await this.collectionService.findOneRecordAndUpdate({ _id: collection._id }, { $push: { products } });
        }
        return collection;
    }
    async findAllCollections(type, user) {
        let collections;
        if (type === 'all') {
            collections = await this.collectionService.findAllCollections({ creator: user._id });
        }
        else {
            collections = await this.collectionService.findAllCollections({
                type: type,
                creator: user._id,
            });
        }
        return collections;
    }
    async findOneCollections(user) {
        return await this.collectionService.findOneRecord({ creator: user._id });
    }
    async addProduct({ collection, product }) {
        return await this.collectionService.findOneRecordAndUpdate({ _id: collection }, { $push: { products: product } });
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('/inventory'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "inventory", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('type', new common_1.ParseEnumPipe(['all', 'active', 'draft', 'archived']))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_checkout_dto_1.CreateCheckoutDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('collection/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_collection_dto_1.CreateCollectionDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createCollection", null);
__decorate([
    (0, common_1.Get)('collection/find-all'),
    __param(0, (0, common_1.Query)('type', new common_1.ParseEnumPipe(['automated', 'manual', 'all']))),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAllCollections", null);
__decorate([
    (0, common_1.Get)('collection/find-one'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOneCollections", null);
__decorate([
    (0, common_1.Put)('collection/add-product'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_product_dto_1.AddProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "addProduct", null);
ProductController = __decorate([
    (0, common_1.Controller)('product'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        collection_service_1.CollectionService,
        helpers_1.StripeService,
        address_service_1.AddressService])
], ProductController);
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map