"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundraisingModule = void 0;
const common_1 = require("@nestjs/common");
const fudraising_controller_1 = require("./fudraising.controller");
const posts_module_1 = require("../posts/posts.module");
const mongoose_1 = require("@nestjs/mongoose");
const category_schema_1 = require("./category.schema");
const subCategory_schema_1 = require("./subCategory.schema");
const category_service_1 = require("./category.service");
const subcategory_service_1 = require("./subcategory.service");
const fundraising_schema_1 = require("./fundraising.schema");
const fundraising_service_1 = require("./fundraising.service");
const helpers_1 = require("../helpers");
const fund_schema_1 = require("./fund.schema");
const fund_service_1 = require("./fund.service");
const notification_module_1 = require("../notification/notification.module");
const firebase_module_1 = require("../firebase/firebase.module");
let FundraisingModule = class FundraisingModule {
};
FundraisingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => posts_module_1.PostsModule),
            mongoose_1.MongooseModule.forFeature([{ name: category_schema_1.FundraisingCategory.name, schema: category_schema_1.FundraisingCategorySchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: subCategory_schema_1.FundraisingSubcategory.name, schema: subCategory_schema_1.FundraisingSubcategorySchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: fundraising_schema_1.Fundraising.name, schema: fundraising_schema_1.FundraisingSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: fund_schema_1.Fund.name, schema: fund_schema_1.FundSchema }]),
            notification_module_1.NotificationModule,
            firebase_module_1.FirebaseModule,
        ],
        controllers: [fudraising_controller_1.FundraisingController],
        providers: [category_service_1.FudraisingCategoryService, subcategory_service_1.FudraisingSubCategoryService, fundraising_service_1.FundraisingService, helpers_1.StripeService, fund_service_1.FundService],
        exports: [fundraising_service_1.FundraisingService, fund_service_1.FundService],
    })
], FundraisingModule);
exports.FundraisingModule = FundraisingModule;
//# sourceMappingURL=fudraising.module.js.map