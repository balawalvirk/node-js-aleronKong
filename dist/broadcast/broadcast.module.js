"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastModule = void 0;
const common_1 = require("@nestjs/common");
const broadcast_service_1 = require("./broadcast.service");
const broadcast_controller_1 = require("./broadcast.controller");
const mongoose_1 = require("@nestjs/mongoose");
const broadcast_schema_1 = require("./broadcast.schema");
const helpers_1 = require("../helpers");
const axios_1 = require("@nestjs/axios");
const posts_module_1 = require("../posts/posts.module");
let BroadcastModule = class BroadcastModule {
};
BroadcastModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: broadcast_schema_1.Broadcast.name, schema: broadcast_schema_1.BroadcastSchema }]), axios_1.HttpModule, posts_module_1.PostsModule],
        controllers: [broadcast_controller_1.BroadcastController],
        providers: [broadcast_service_1.BroadcastService, helpers_1.SocketGateway],
    })
], BroadcastModule);
exports.BroadcastModule = BroadcastModule;
//# sourceMappingURL=broadcast.module.js.map