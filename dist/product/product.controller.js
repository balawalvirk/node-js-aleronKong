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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const address_service_1 = require("../address/address.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const role_guard_1 = require("../auth/role.guard");
const cart_service_1 = require("./cart.service");
const helpers_1 = require("../helpers");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const types_1 = require("../types");
const category_service_1 = require("./category.service");
const create_category_dto_1 = require("./dtos/create-category.dto");
const create_product_dto_1 = require("./dtos/create-product.dto");
const update_product_dto_1 = require("./dtos/update-product.dto");
const product_service_1 = require("./product.service");
const order_service_1 = require("../order/order.service");
const buy_product_dto_1 = require("./dtos/buy-product.dto");
const add_to_cart_dto_1 = require("./dtos/add-to-cart.dto");
const sale_service_1 = require("./sale.service");
const users_service_1 = require("../users/users.service");
const find_store_products_query_dto_1 = require("./dtos/find-store-products-query.dto");
const review_service_1 = require("../review/review.service");
const create_review_dto_1 = require("./dtos/create-review.dto");
const find_all_products_query_1 = require("./dtos/find-all-products.query");
const notification_service_1 = require("../notification/notification.service");
const firebase_service_1 = require("../firebase/firebase.service");
const find_all_categories_query_dto_1 = require("./dtos/find-all-categories.query.dto");
const update_category_dto_1 = require("./dtos/update.category.dto");
const buy_series_dto_1 = require("./dtos/buy-series.dto");
const Shopify = require("shopify-api-node");
const create_showcase_product_dto_1 = require("./dtos/create-showcase-product.dto");
const track_dto_1 = require("./dtos/track.dto");
const track_service_1 = require("./track.service");
const find_bought_query_dto_1 = require("./dtos/find-bought.query.dto");
let ProductController = class ProductController {
    constructor(productService, stripeService, addressService, categoryService, cartService, orderService, saleService, userService, reviewService, notificationService, firebaseService, trackService) {
        this.productService = productService;
        this.stripeService = stripeService;
        this.addressService = addressService;
        this.categoryService = categoryService;
        this.cartService = cartService;
        this.orderService = orderService;
        this.saleService = saleService;
        this.userService = userService;
        this.reviewService = reviewService;
        this.notificationService = notificationService;
        this.firebaseService = firebaseService;
        this.trackService = trackService;
    }
    async create(createProductDto, user) {
        if (createProductDto.webSeries) {
            createProductDto.series = createProductDto.series.map((series) => (series.price === 0 ? Object.assign(Object.assign({}, series), { isFree: true }) : series));
        }
        return await this.productService.create(createProductDto.price === 0 ? Object.assign(Object.assign({}, createProductDto), { isFree: true, creator: user._id }) : Object.assign(Object.assign({}, createProductDto), { creator: user._id }));
    }
    async remove(id, user) {
        const productFound = await this.productService.findOneRecord({ _id: id });
        if (productFound.creator == user._id.toString() || user.role.includes(types_1.UserRoles.ADMIN)) {
            const product = await this.productService.deleteSingleRecord({ _id: id });
            await this.saleService.deleteManyRecord({ product: product._id });
            if (product.type === types_1.ProductType.DIGITAL)
                await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { boughtDigitalProducts: product._id } });
            return product;
        }
        else
            throw new common_1.HttpException('Forbidden resource', common_1.HttpStatus.FORBIDDEN);
    }
    async update(id, updateProductDto, user) {
        console.log({ this: 'this' });
        const product = await this.productService.findOneRecord({ _id: id });
        if (!product)
            throw new common_1.HttpException('Product does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (product.creator != user._id.toString())
            throw new common_1.HttpException('Forbidden resource', common_1.HttpStatus.FORBIDDEN);
        return await this.productService.update({ _id: id }, updateProductDto);
    }
    async findAllProducts(_a) {
        var { page, limit } = _a, rest = __rest(_a, ["page", "limit"]);
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const products = await this.productService.find(rest, options);
        const total = await this.productService.countRecords(rest);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: products,
        };
        return paginated;
    }
    async findOne(id, user) {
        var _a;
        const product = await this.productService.findOne({ _id: id });
        if (!product)
            throw new common_1.BadRequestException('Product does not exists.');
        const webSeries = (_a = user === null || user === void 0 ? void 0 : user.boughtWebSeries) === null || _a === void 0 ? void 0 : _a.find((series) => series.equals(id));
        if (webSeries) {
            const series = [];
            const sales = await this.saleService.findAllRecords({ customer: user._id, product: id });
            const boughtSeries = sales.map((sale) => [...series, ...sale.series]).flat();
            const result = Object.assign(Object.assign({}, product.toJSON()), { boughtSeries });
            return result;
        }
        else
            return product;
    }
    async findStoreProducts(_a, user) {
        var { showBoughtProducts } = _a, rest = __rest(_a, ["showBoughtProducts"]);
        const ObjectId = mongoose_1.default.Types.ObjectId;
        if (!showBoughtProducts) {
            Object.keys(rest).forEach((key) => (rest[key] = new ObjectId(rest[key])));
            return await this.productService.findStoreProducts(rest);
        }
        else {
            const totalProducts = [...user.boughtDigitalProducts, ...user.boughtWebSeries].map((product) => new ObjectId(product));
            const sorting = this.productService.getBoughtProductsSorting(types_1.BoughtProductsSort.TITLE);
            return await this.productService.getBoughtProducts({ _id: { $in: totalProducts } }, sorting);
        }
    }
    async findBoughtProducts({ sort }, user) {
        const ObjectId = mongoose_1.default.Types.ObjectId;
        const totalProducts = [...user.boughtDigitalProducts, ...user.boughtWebSeries].map((product) => new ObjectId(product));
        const sorting = this.productService.getBoughtProductsSorting(sort);
        const products = await this.productService.getBoughtProducts({ _id: { $in: totalProducts } }, sorting);
        for (const productObj of products) {
            for (const product of productObj.products) {
                if (product.series.length > 0) {
                    const series = (await this.productService.findOneRecord({ _id: product._id })).series;
                    const tracks = await this.trackService.findAllRecords({ product: { $in: series }, user: user._id });
                    const completedTracks = tracks.filter((track) => track.isCompleted);
                    if (completedTracks.length === tracks.length) {
                        product.isWebSeriesCompleted = true;
                    }
                }
            }
        }
        return products;
    }
    async checkout(user) {
        const { city, line1, line2, country, state, postalCode } = await this.addressService.findOneRecord({ _id: user.defaultAddress });
        const cart = await this.cartService.findOne({ creator: user._id });
        const { total } = this.cartService.calculateTax(cart.items);
        const paymentIntent = await this.stripeService.createPaymentIntent({
            currency: 'usd',
            payment_method: user.defaultPaymentMethod,
            amount: Math.round(total * 100),
            customer: user.customerId,
            confirm: true,
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
        });
        await this.cartService.deleteSingleRecord({ creator: user._id });
        for (const { item, quantity } of cart.items) {
            await this.saleService.createRecord({
                product: item._id,
                customer: user._id,
                seller: item.creator._id,
                price: item.price,
                quantity,
                productType: types_1.ProductType.PHYSICAL,
            });
        }
        for (const { item, quantity, selectedColor, selectedSize } of cart.items) {
            const order = await this.orderService.createRecord({
                customer: user._id,
                address: user.defaultAddress,
                product: item._id,
                quantity: quantity,
                selectedColor: selectedColor,
                selectedSize: selectedSize,
                paymentMethod: user.defaultPaymentMethod,
                seller: item.creator._id,
                paymentIntent: paymentIntent.id,
                orderNumber: this.orderService.getOrderNumber(),
            });
            await this.notificationService.createRecord({
                order: order._id,
                sender: user._id,
                receiver: item.creator._id,
                message: 'has placed an order',
                type: types_1.NotificationType.ORDER_PLACED,
            });
            if (item.creator.fcmToken) {
                await this.firebaseService.sendNotification({
                    token: item.creator.fcmToken,
                    notification: {
                        title: `${user.firstName} ${user.lastName} has placed an order`,
                    },
                    data: { order: order._id.toString(), type: types_1.NotificationType.ORDER_PLACED },
                });
            }
        }
        return { message: 'Order placed successfully.' };
    }
    async buyProduct(user, buyProductDto) {
        const product = await this.productService.findOne({ _id: buyProductDto.product });
        if (!product)
            throw new common_1.HttpException('Product does not exists.', common_1.HttpStatus.BAD_REQUEST);
        const { total, applicationFeeAmount } = this.productService.calculateTax(product.price, product.category.commission);
        await this.stripeService.createPaymentIntent({
            currency: 'usd',
            payment_method: user.defaultPaymentMethod,
            amount: total,
            customer: user.customerId,
            confirm: true,
            transfer_data: { destination: product.creator.sellerId },
            application_fee_amount: applicationFeeAmount,
            description: `Payment of product ${product.title}`,
        });
        await this.saleService.createRecord({
            productType: types_1.ProductType.DIGITAL,
            customer: user._id,
            seller: product.creator._id,
            price: product.price,
            product: product._id,
        });
        await this.notificationService.createRecord({
            product: product._id,
            sender: user._id,
            receiver: product.creator._id,
            type: types_1.NotificationType.PRODUCT_BOUGHT,
            message: 'has bought your product.',
        });
        await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { boughtDigitalProducts: product._id } });
        if (product.creator.fcmToken) {
            await this.firebaseService.sendNotification({
                token: product.creator.fcmToken,
                notification: {
                    title: `${user.firstName} ${user.lastName} has bought your product.`,
                },
                data: { product: product._id.toString(), type: types_1.NotificationType.PRODUCT_BOUGHT },
            });
        }
        return { message: 'Thanks for purchasing the product.' };
    }
    async buySeries(user, buySeriesDto) {
        const product = await this.productService.findOne({ _id: buySeriesDto.product });
        if (!product)
            throw new common_1.HttpException('Product does not exists.', common_1.HttpStatus.BAD_REQUEST);
        const series = product.series.filter((series) => buySeriesDto.series.includes(series._id.toString()));
        if (series.length === 0)
            throw new common_1.BadRequestException('Series does not exists.');
        const subTotal = series.reduce((n, { price }) => n + price, 0);
        const { total, applicationFeeAmount } = this.productService.calculateTax(subTotal, product.category.commission);
        const allSeries = series.map((series) => series._id);
        await this.stripeService.createPaymentIntent({
            currency: 'usd',
            payment_method: buySeriesDto.paymentMethod,
            amount: total,
            customer: user.customerId,
            confirm: true,
            transfer_data: { destination: product.creator.sellerId },
            application_fee_amount: applicationFeeAmount,
            description: `payment intent of episodes of product ${product.title}`,
        });
        await this.saleService.createRecord({
            productType: types_1.ProductType.DIGITAL,
            customer: user._id,
            seller: product.creator._id,
            price: total,
            product: product._id,
            series: allSeries,
        });
        const webSeriesExists = user.boughtWebSeries.find((series) => series.toString() == product._id);
        if (!webSeriesExists)
            await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { boughtWebSeries: product._id } });
        await this.notificationService.createRecord({
            product: product._id,
            sender: user._id,
            receiver: product.creator._id,
            type: types_1.NotificationType.PRODUCT_BOUGHT,
            message: 'has bought your product.',
        });
        if (product.creator.fcmToken) {
            await this.firebaseService.sendNotification({
                token: product.creator.fcmToken,
                notification: {
                    title: `${user.firstName} ${user.lastName} has bought your product.`,
                },
                data: { product: product._id.toString(), type: types_1.NotificationType.PRODUCT_BOUGHT },
            });
        }
        return { message: 'Thanks for purchasing the products.' };
    }
    async findAllTrendingProducts(category) {
        return await this.productService.find({ category }, { sort: { avgRating: -1 } });
    }
    async createCategory(createProductCategoryDto) {
        const category = await this.categoryService.findOneRecord({ title: createProductCategoryDto.title });
        if (category)
            throw new common_1.BadRequestException('Category with this title already exists.');
        return await this.categoryService.createRecord(createProductCategoryDto);
    }
    async findAllCategories(_a) {
        var { query, limit, page } = _a, rest = __rest(_a, ["query", "limit", "page"]);
        const $q = (0, helpers_1.makeQuery)({ page, limit, query });
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const rjx = { $regex: $q.query, $options: 'i' };
        const condition = Object.assign(Object.assign({}, rest), { title: rjx });
        const total = await this.categoryService.countRecords(condition);
        const categories = await this.categoryService.findAllRecords(condition, options);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: categories,
        };
        return paginated;
    }
    async deleteCategory(id) {
        await this.categoryService.deleteSingleRecord({ _id: id });
        return { message: 'Category deleted successfully.' };
    }
    async updateCategory(id, { title, type }) {
        await this.categoryService.findOneRecordAndUpdate({ _id: id }, { title, type });
        return { message: 'Category updated successfully.' };
    }
    async findCart(user) {
        const cart = await this.cartService.findOne({ creator: user._id });
        if (!cart)
            return { message: 'Your cart is empty.' };
        const { tax, subTotal, total } = this.cartService.calculateTax(cart.items);
        return Object.assign(Object.assign({}, cart), { subTotal, total, tax });
    }
    async addItem(user, id, addToCartDto) {
        const product = await this.productService.findOneRecord({ _id: id });
        if (!product)
            throw new common_1.HttpException('Product does not exists', common_1.HttpStatus.BAD_REQUEST);
        const cartExists = await this.cartService.findOneRecord({ creator: user._id });
        if (!cartExists) {
            const cart = await this.cartService.create({ creator: user._id, items: [Object.assign({ item: id }, addToCartDto)] });
            const { total, subTotal, tax } = this.cartService.calculateTax(cart.items);
            return Object.assign(Object.assign({}, cart.toJSON()), { subTotal, total, tax });
        }
        else {
            const item = cartExists.items.find((item) => item.item == id);
            if (item)
                throw new common_1.BadRequestException('You already added this item in cart.');
            const cart = await this.cartService.findOneAndUpdate({ creator: user._id }, { $push: { items: Object.assign({ item: id }, addToCartDto) } });
            const { total, subTotal, tax } = this.cartService.calculateTax(cart.items);
            return Object.assign(Object.assign({}, cart), { total, subTotal, tax });
        }
    }
    async removeProduct(id, user) {
        const cart = await this.cartService.findOneAndUpdate({ creator: user._id }, { $pull: { items: { item: id } } });
        const { total, subTotal, tax } = this.cartService.calculateTax(cart.items);
        return Object.assign(Object.assign({}, cart), { total, subTotal, tax });
    }
    async increaseDecreaseItem(id, user, inc, dec) {
        await this.productService.findOneRecord({ _id: id });
        if (!inc && !dec)
            throw new common_1.HttpException('inc or dec query string is required', common_1.HttpStatus.BAD_REQUEST);
        const cart = await this.cartService.findOneAndUpdate({ 'items.item': id, creator: user._id }, { $inc: { 'items.$.quantity': inc ? 1 : -1 } });
        const { total, tax, subTotal } = this.cartService.calculateTax(cart.items);
        return Object.assign(Object.assign({}, cart), { total, tax, subTotal });
    }
    async createShowcaseProduct({ product }, user) {
        return await this.productService.findOneRecordAndUpdate({ _id: product }, { creator: user._id, isShowCase: true });
    }
    async deleteShowcaseProduct(id) {
        return await this.productService.deleteSingleRecord({ _id: id });
    }
    async updateShowcaseProduct(id, updateProductDto) {
        return await this.productService.findOneRecordAndUpdate({ _id: id }, updateProductDto);
    }
    async findAllShowcaseProducts() {
        return await this.productService.findAllRecords({ isShowCase: true });
    }
    async createReview(user, createReviewDto) {
        const product = await this.productService.findOneRecord({ _id: createReviewDto.product }).populate('reviews');
        if (!product)
            throw new common_1.HttpException('Product does not exists.', common_1.HttpStatus.BAD_REQUEST);
        const review = await this.reviewService.createRecord({
            review: createReviewDto.review,
            product: createReviewDto.product,
            rating: createReviewDto.rating,
            creator: user._id,
            order: createReviewDto.order,
        });
        const reviews = [...product.reviews, review];
        const avgRating = Math.round(reviews.reduce((n, { rating }) => n + rating / reviews.length, 0) * 10) / 10;
        await this.productService.findOneRecordAndUpdate({ _id: createReviewDto.product }, { $push: { reviews: review._id }, avgRating });
        return { message: 'Thanks for sharing your review.' };
    }
    async findAllReviews(id) {
        return await this.reviewService.find({ product: id }, { sort: { createdAt: -1 } });
    }
    async findAllShopifyProducts(user) {
        const { shopifyAccessToken, shopifyStoreName } = user;
        if (!shopifyAccessToken || !shopifyStoreName)
            throw new common_1.BadRequestException('User does not have required shopify credientals.');
        const shopify = new Shopify({ shopName: shopifyStoreName, accessToken: shopifyAccessToken });
        return await shopify.product.list();
    }
    async track(trackDto, user) {
        const { product, series } = trackDto, rest = __rest(trackDto, ["product", "series"]);
        if (series) {
            const trackFound = await this.trackService.findOneRecordAndUpdate({ user: user._id, product: series }, rest);
            if (trackFound)
                return trackFound;
            const track = await this.trackService.createRecord(Object.assign(Object.assign({}, rest), { user: user._id, product: series }));
            await this.productService.findOneRecordAndUpdate({ _id: product, 'series._id': series }, { $push: { 'series.$.tracks': track._id } });
            return track;
        }
        else {
            const trackFound = await this.trackService.findOneRecordAndUpdate({ user: user._id, product }, rest);
            if (trackFound)
                return trackFound;
            const track = await this.trackService.createRecord(Object.assign(Object.assign({}, trackDto), { user: user._id }));
            await this.productService.findOneRecordAndUpdate({ _id: product }, { $push: { tracks: track._id } });
            return track;
        }
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
    (0, common_1.Delete)(':id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_products_query_1.FindAllProductsQuery]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAllProducts", null);
__decorate([
    (0, common_1.Get)(':id/find-one'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('store'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_store_products_query_dto_1.FindStoreProductsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findStoreProducts", null);
__decorate([
    (0, common_1.Get)('find-bought'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_bought_query_dto_1.FindBoughtProductsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findBoughtProducts", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('buy'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, buy_product_dto_1.BuyProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "buyProduct", null);
__decorate([
    (0, common_1.Post)('buy-series'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, buy_series_dto_1.BuySeriesDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "buySeries", null);
__decorate([
    (0, common_1.Get)('trending/find-all'),
    __param(0, (0, common_1.Query)('category', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAllTrendingProducts", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Post)('category/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateProductCategoryDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('category/find-all'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_categories_query_dto_1.FindAllCategoriesQueryDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAllCategories", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Delete)('category/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteCategory", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Put)('category/:id/update'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateProductCategoryDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Get)('cart'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findCart", null);
__decorate([
    (0, common_1.Post)(':id/add-to-cart'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_to_cart_dto_1.AddToCartDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "addItem", null);
__decorate([
    (0, common_1.Put)(':id/remove-from-cart'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "removeProduct", null);
__decorate([
    (0, common_1.Put)(':id/cart/inc-dec'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Query)('inc')),
    __param(3, (0, common_1.Query)('dec')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "increaseDecreaseItem", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Post)('showcase/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_showcase_product_dto_1.CreateShowCaseProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createShowcaseProduct", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Delete)('showcase/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteShowcaseProduct", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Put)('showcase/:id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateShowcaseProduct", null);
__decorate([
    (0, common_1.Get)('showcase/find-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAllShowcaseProducts", null);
__decorate([
    (0, common_1.Post)('review/create'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)(':id/review/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAllReviews", null);
__decorate([
    (0, common_1.Get)('shopify/find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAllShopifyProducts", null);
__decorate([
    (0, common_1.Post)('track'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [track_dto_1.TrackDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "track", null);
ProductController = __decorate([
    (0, common_1.Controller)('product'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RolesGuard),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        helpers_1.StripeService,
        address_service_1.AddressService,
        category_service_1.ProductCategoryService,
        cart_service_1.CartService,
        order_service_1.OrderService,
        sale_service_1.SaleService,
        users_service_1.UsersService,
        review_service_1.ReviewService,
        notification_service_1.NotificationService,
        firebase_service_1.FirebaseService,
        track_service_1.TrackService])
], ProductController);
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map