"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModule = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
const product_controller_1 = require("./product.controller");
const product_schema_1 = require("./product.schema");
const mongoose_1 = require("@nestjs/mongoose");
const helpers_1 = require("../helpers");
const address_module_1 = require("../address/address.module");
const category_schema_1 = require("./category.schema");
const category_service_1 = require("./category.service");
const cart_schema_1 = require("./cart.schema");
const cart_service_1 = require("./cart.service");
const order_module_1 = require("../order/order.module");
const sale_schema_1 = require("./sale.schema");
const sale_service_1 = require("./sale.service");
const users_module_1 = require("../users/users.module");
const notification_module_1 = require("../notification/notification.module");
const firebase_module_1 = require("../firebase/firebase.module");
const review_module_1 = require("../review/review.module");
const tracking_schema_1 = require("./tracking.schema");
const track_service_1 = require("./track.service");
let ProductModule = class ProductModule {
};
ProductModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: category_schema_1.ProductCategory.name, schema: category_schema_1.ProductCategorySchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: cart_schema_1.Cart.name, schema: cart_schema_1.CartSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: tracking_schema_1.Track.name, schema: tracking_schema_1.TrackSchema }]),
            review_module_1.ReviewModule,
            address_module_1.AddressModule,
            order_module_1.OrderModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            notification_module_1.NotificationModule,
            firebase_module_1.FirebaseModule,
        ],
        controllers: [product_controller_1.ProductController],
        providers: [product_service_1.ProductService, helpers_1.StripeService, category_service_1.ProductCategoryService, cart_service_1.CartService, sale_service_1.SaleService, track_service_1.TrackService],
        exports: [product_service_1.ProductService, cart_service_1.CartService, sale_service_1.SaleService],
    })
], ProductModule);
exports.ProductModule = ProductModule;
//# sourceMappingURL=product.module.js.map