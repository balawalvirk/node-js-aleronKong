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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const users_service_1 = require("../users/users.service");
const create_comment_1 = require("./dtos/create-comment");
const posts_service_1 = require("./posts.service");
let PostsController = class PostsController {
    constructor(postsService, usersService) {
        this.postsService = postsService;
        this.usersService = usersService;
    }
    async findAll(user, privacy) {
        return await this.postsService.findAllPosts({
            privacy,
            blockers: { $nin: [user._id] },
        });
    }
    async findMine(user) {
        return await this.postsService.findAllPosts({
            creator: user._id,
        });
    }
    async addLike(postId, user) {
        await this.usersService.findOneRecord({ _id: user._id });
        return await this.postsService.updatePost(postId, {
            $push: { likes: user._id },
        });
    }
    async createComment(postId, user, body) {
        return await this.postsService.updatePost(postId, {
            $push: { comments: { content: body.content, creator: user._id } },
        });
    }
    async blockPost(postId, user) {
        return await this.postsService.findOneRecordAndUpdate({ _id: postId }, {
            $push: { blockers: user._id },
        });
    }
    async reportPost(postId, user) {
        return await this.postsService.findOneRecordAndUpdate({ _id: postId }, { reporter: user._id });
    }
};
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('privacy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('find-all/mine'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Post)('like/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "addLike", null);
__decorate([
    (0, common_1.Post)('comment/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Put)('block/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "blockPost", null);
__decorate([
    (0, common_1.Put)('report/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "reportPost", null);
PostsController = __decorate([
    (0, common_1.Controller)('post'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [posts_service_1.PostsService, users_service_1.UsersService])
], PostsController);
exports.PostsController = PostsController;
//# sourceMappingURL=posts.controller.js.map