"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageModule = void 0;
const common_1 = require("@nestjs/common");
const package_service_1 = require("./package.service");
const package_controller_1 = require("./package.controller");
const mongoose_1 = require("@nestjs/mongoose");
const package_schema_1 = require("./package.schema");
const helpers_1 = require("../helpers");
const users_module_1 = require("../users/users.module");
const firebase_service_1 = require("../firebase/firebase.service");
const notification_module_1 = require("../notification/notification.module");
let PackageModule = class PackageModule {
};
PackageModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: package_schema_1.Package.name, schema: package_schema_1.PackageSchema }]), users_module_1.UsersModule, notification_module_1.NotificationModule],
        controllers: [package_controller_1.PackageController],
        providers: [package_service_1.PackageService, helpers_1.StripeService, firebase_service_1.FirebaseService],
        exports: [package_service_1.PackageService],
    })
], PackageModule);
exports.PackageModule = PackageModule;
//# sourceMappingURL=package.module.js.map