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
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
const users_service_1 = require("../users/users.service");
const create_group_dto_1 = require("./group/dto/create-group.dto");
const update_group_dto_1 = require("./group/dto/update-group.dto");
const group_service_1 = require("./group/group.service");
const create_comment_1 = require("./posts/dtos/create-comment");
const create_posts_1 = require("./posts/dtos/create-posts");
const posts_service_1 = require("./posts/posts.service");
let SocialController = class SocialController {
    constructor(postsService, usersService, groupService) {
        this.postsService = postsService;
        this.usersService = usersService;
        this.groupService = groupService;
    }
    async createPost(createPostsDto, user) {
        const post = await this.postsService.createRecord(Object.assign({ creator: user._id }, createPostsDto));
        if (post.group)
            await this.groupService.findOneRecordAndUpdate({ _id: post.group }, { $push: { posts: post._id } });
    }
    async findAllPosts(user, privacy) {
        return await this.postsService.findAllPosts({
            privacy,
            blockers: { $nin: [user._id] },
        });
    }
    async findMinePosts(user) {
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
    async createGroup(createGroupDto, user) {
        return await this.groupService.createRecord(Object.assign(Object.assign({}, createGroupDto), { creator: user._id }));
    }
    async findOneGroup(id) {
        return await this.groupService.findOne({ _id: id });
    }
    async updateGroup(id, updateGroupDto) {
        return await this.groupService.findOneRecordAndUpdate({ _id: id }, updateGroupDto);
    }
    async joinGroup(user, id) {
        const group = await this.groupService.findOneRecord({ _id: id });
        if (group) {
            const memberFound = group.members.filter((member) => member.member === user._id);
            if (memberFound.length > 0)
                throw new common_1.HttpException('You are already a member of this group.', common_1.HttpStatus.BAD_REQUEST);
            if (group.privacy === types_1.GroupPrivacy.PRIVATE) {
                const requestFound = group.requests.filter((request) => request === user._id);
                if (requestFound.length > 0)
                    throw new common_1.HttpException('Your request to join group is pending.', common_1.HttpStatus.BAD_REQUEST);
                return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { requests: user._id } });
            }
            return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { members: { member: user._id } } });
        }
        else
            throw new common_1.HttpException('Group does not exists.', common_1.HttpStatus.BAD_REQUEST);
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
    (0, common_1.Post)('post/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_posts_1.CreatePostsDto, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('post/find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Query)('privacy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "findAllPosts", null);
__decorate([
    (0, common_1.Get)('post/find-all/mine'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "findMinePosts", null);
__decorate([
    (0, common_1.Post)('post/like/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "addLike", null);
__decorate([
    (0, common_1.Post)('post/comment/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, helpers_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createComment", null);
__decorate([
    (0, common_1.Put)('post/block/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "blockPost", null);
__decorate([
    (0, common_1.Put)('post/report/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "reportPost", null);
__decorate([
    (0, common_1.Post)('group/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Get)('group/find-one/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "findOneGroup", null);
__decorate([
    (0, common_1.Put)('group/update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_dto_1.UpdateGroupDto]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Put)('group/join/:id'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "joinGroup", null);
__decorate([
    (0, common_1.Put)('group/leave/:id'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "leaveGroup", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('all-members/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "findAllMembers", null);
__decorate([
    (0, common_1.Get)('all-requests/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "findAllRequests", null);
__decorate([
    Patch('request/:id/:userId'),
    __param(0, (0, common_1.Query)('isApproved', new ParseBoolPipe())),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(2, (0, common_1.Param)('userId', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "approveRejectRequest", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('query', new DefaultValuePipe(''))),
    __param(2, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "findAllGroups", null);
__decorate([
    Patch('report/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, helpers_1.GetUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "report", null);
SocialController = __decorate([
    (0, common_1.Controller)('social'),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        users_service_1.UsersService,
        group_service_1.GroupService])
], SocialController);
exports.SocialController = SocialController;
//# sourceMappingURL=social.controller.js.map