"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_module_1 = require("../users/users.module");
const group_service_1 = require("./group/group.service");
const posts_schema_1 = require("./posts/posts.schema");
const posts_service_1 = require("./posts/posts.service");
const social_controller_1 = require("./social.controller");
let SocialModule = class SocialModule {
};
SocialModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: posts_schema_1.Posts.name, schema: posts_schema_1.PostSchema }]), users_module_1.UsersModule],
        controllers: [social_controller_1.SocialController],
        providers: [group_service_1.GroupService, posts_service_1.PostsService],
    })
], SocialModule);
exports.SocialModule = SocialModule;
//# sourceMappingURL=social.module.js.map