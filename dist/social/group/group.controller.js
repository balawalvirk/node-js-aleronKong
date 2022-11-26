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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("./group.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const posts_service_1 = require("src/social/posts/posts.service");
let GroupController = class GroupController {
    constructor(groupService, postService) {
        this.groupService = groupService;
        this.postService = postService;
    }
};
GroupController = __decorate([
    (0, common_1.Controller)('group'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof group_service_1.GroupService !== "undefined" && group_service_1.GroupService) === "function" ? _a : Object, typeof (_b = typeof posts_service_1.PostsService !== "undefined" && posts_service_1.PostsService) === "function" ? _b : Object])
], GroupController);
exports.GroupController = GroupController;
//# sourceMappingURL=group.controller.js.map