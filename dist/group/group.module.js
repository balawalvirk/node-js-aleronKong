"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupModule = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("./group.service");
const group_controller_1 = require("./group.controller");
const mongoose_1 = require("@nestjs/mongoose");
const group_schema_1 = require("./group.schema");
const posts_module_1 = require("../posts/posts.module");
let GroupModule = class GroupModule {
};
GroupModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: group_schema_1.Group.name, schema: group_schema_1.GroupSchema }]), posts_module_1.PostsModule],
        controllers: [group_controller_1.GroupController],
        providers: [group_service_1.GroupService],
    })
], GroupModule);
exports.GroupModule = GroupModule;
//# sourceMappingURL=group.module.js.map