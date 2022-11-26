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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("./group.service");
const create_group_dto_1 = require("./dto/create-group.dto");
const update_group_dto_1 = require("./dto/update-group.dto");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const posts_service_1 = require("../posts/posts.service");
const create_posts_1 = require("../posts/dtos/create-posts");
const types_1 = require("../types");
const helpers_1 = require("../helpers");
let GroupController = class GroupController {
    constructor(groupService, postService) {
        this.groupService = groupService;
        this.postService = postService;
    }
    async create(createGroupDto, user) {
        return await this.groupService.createRecord(Object.assign(Object.assign({}, createGroupDto), { creator: user._id }));
    }
    async createPost(createPostDto, user) {
        const post = await this.postService.createRecord(Object.assign(Object.assign({}, createPostDto), { creator: user._id }));
        if (post.group) {
            await this.groupService.findOneRecordAndUpdate({ _id: post.group }, { $push: { posts: post._id } });
        }
        return post;
    }
    async findOne(id) {
        return await this.groupService.findOne({ _id: id });
    }
    async update(id, updateGroupDto) {
        return await this.groupService.findOneRecordAndUpdate({ _id: id }, updateGroupDto);
    }
    async joinGroup(user, id) {
        const group = await this.groupService.findOneRecord({ _id: id });
        if (group) {
            const memberFound = group.members.filter((member) => member.member === user._id);
            if (memberFound.length > 0)
                throw new common_1.BadRequestException('You are already a member of this group.');
            if (group.privacy === types_1.GroupPrivacy.PRIVATE) {
                const requestFound = group.requests.filter((request) => request === user._id);
                if (requestFound.length > 0)
                    throw new common_1.BadRequestException('Your request to join group is pending.');
                return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { requests: user._id } });
            }
            return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { members: { member: user._id } } });
        }
        else
            throw new common_1.BadRequestException('Group does not exists.');
    }
    async leaveGroup(user, id) {
        await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { members: { member: user._id } } });
        return 'Group left successfully.';
    }
    async remove(id) {
        const group = await this.groupService.deleteSingleRecord({ _id: id });
        await this.postService.deleteManyRecord({ group: group._id });
        return 'Group deleted successfully.';
    }
    async findAllMembers(id) {
        const group = await this.groupService.findAllMembers({ _id: id });
        return group.members;
    }
    async findAllRequests(id) {
        const group = await this.groupService.findAllRequests({ _id: id });
        return group.requests;
    }
    async approveRejectRequest(isApproved, id, userId) {
        if (isApproved) {
            await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });
            return 'Request approved successfully.';
        }
        else {
            await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
            return 'Request rejected successfully.';
        }
    }
    async findAllGroups(type, query, user) {
        let groups;
        if (type === 'forYou') {
            groups = await this.groupService.findAllRecords({
                name: { $regex: query, $options: 'i' },
                'members.member': user._id,
            });
        }
        else if (type === 'yourGroups') {
            groups = await this.groupService.findAllRecords({
                $or: [{ name: { $regex: query, $options: 'i' } }, { creator: user._id }],
            });
        }
        else if (type === 'discover') {
            groups = await this.groupService.findAllRecords({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { 'members.member': { $ne: user._id }, creator: { $ne: user._id } },
                ],
            });
        }
        else {
            groups = await this.groupService.findAllRecords();
        }
        return groups;
    }
    async report(id, user, reason) {
        await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { reports: { reporter: user._id, reason } } });
        return 'Report submitted successfully.';
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('post/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_posts_1.CreatePostsDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('find-one/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_dto_1.UpdateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('join/:id'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "joinGroup", null);
__decorate([
    (0, common_1.Put)('leave/:id'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "leaveGroup", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('all-members/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAllMembers", null);
__decorate([
    (0, common_1.Get)('all-requests/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAllRequests", null);
__decorate([
    (0, common_1.Put)('request/:id/:userId'),
    __param(0, (0, common_1.Query)('isApproved', new common_1.ParseBoolPipe())),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(2, (0, common_1.Param)('userId', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "approveRejectRequest", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('query', new common_1.DefaultValuePipe(''))),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAllGroups", null);
__decorate([
    (0, common_1.Put)('report/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "report", null);
GroupController = __decorate([
    (0, common_1.Controller)('group'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [group_service_1.GroupService,
        posts_service_1.PostsService])
], GroupController);
exports.GroupController = GroupController;
//# sourceMappingURL=group.controller.js.map