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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const role_guard_1 = require("../auth/role.guard");
const firebase_service_1 = require("../firebase/firebase.service");
const group_service_1 = require("../group/group.service");
const moderator_service_1 = require("../group/moderator.service");
const helpers_1 = require("../helpers");
const user_decorator_1 = require("../helpers/decorators/user.decorator");
const notification_service_1 = require("../notification/notification.service");
const report_service_1 = require("../report/report.service");
const types_1 = require("../types");
const users_service_1 = require("../users/users.service");
const comment_service_1 = require("./comment.service");
const add_reactions_dto_1 = require("./dtos/add-reactions.dto");
const create_comment_1 = require("./dtos/create-comment");
const feature_unfeature_dto_1 = require("./dtos/feature-unfeature.dto");
const find_all_comments_query_dto_1 = require("./dtos/find-all-comments.query.dto");
const find_all_post_query_dto_1 = require("./dtos/find-all-post.query.dto");
const find_engaged_posts_query_dto_1 = require("./dtos/find-engaged-posts.query.dto");
const find_home_post_query_dto_1 = require("./dtos/find-home-post.query.dto");
const pin_unpin_post_dto_1 = require("./dtos/pin-unpin-post.dto");
const update_comment_dto_1 = require("./dtos/update-comment.dto");
const update_post_dto_1 = require("./dtos/update-post.dto");
const update_reaction_dto_1 = require("./dtos/update-reaction.dto");
const posts_service_1 = require("./posts.service");
const reaction_service_1 = require("./reaction.service");
let PostsController = class PostsController {
    constructor(postsService, userService, commentService, firebaseService, notificationService, reactionService, groupService, moderatorService, reportService) {
        this.postsService = postsService;
        this.userService = userService;
        this.commentService = commentService;
        this.firebaseService = firebaseService;
        this.notificationService = notificationService;
        this.reactionService = reactionService;
        this.groupService = groupService;
        this.moderatorService = moderatorService;
        this.reportService = reportService;
    }
    async findAll({ page, limit, query }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const rjx = { $regex: query, $options: 'i' };
        const condition = { content: rjx };
        const posts = await this.postsService.findAllRecords(condition, options).populate('creator');
        const total = await this.postsService.countRecords(condition);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }
    async findOne(id) {
        return await this.postsService.findOne({ _id: id });
    }
    async findUserPost(id, page, limit) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const condition = { creator: id };
        const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
        const total = await this.postsService.countRecords(condition);
        const posts = await this.postsService.find(condition, options);
        const paginated = {
            total,
            pages: Math.round(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }
    async findHomePosts(user, { limit, page, sort }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { sort: this.postsService.getHomePostSort(sort), limit: $q.limit, skip: $q.skip };
        const followings = (await this.userService.findAllRecords({ friends: { $in: [user._id] } }).select('_id')).map((user) => user._id);
        const reports = await this.reportService.findAllRecords({ reporter: user._id, type: types_1.ReportType.USER });
        const reportedUsers = reports.map((report) => report.user);
        const groups = (await this.groupService.findAllRecords({ 'members.member': user._id })).map((group) => group._id);
        const condition = {
            creator: { $nin: [...user.blockedUsers, ...reportedUsers] },
            isBlocked: false,
            status: types_1.PostStatus.ACTIVE,
            $or: user.isGuildMember
                ? [
                    { privacy: types_1.PostPrivacy.PUBLIC },
                    { privacy: types_1.PostPrivacy.FOLLOWERS, creator: { $in: followings } },
                    { privacy: types_1.PostPrivacy.GUILD_MEMBERS },
                    { privacy: types_1.PostPrivacy.GROUP, group: { $in: groups } },
                    { creator: user._id },
                ]
                : [
                    { privacy: types_1.PostPrivacy.PUBLIC },
                    { privacy: types_1.PostPrivacy.FOLLOWERS, creator: { $in: followings } },
                    { creator: user._id },
                    { privacy: types_1.PostPrivacy.GROUP, group: { $in: groups } },
                ],
        };
        const posts = await this.postsService.findHomePosts(condition, options);
        const totalPosts = await Promise.all(posts.map(async (post) => {
            const totalComments = await this.commentService.countRecords({ post: post._id });
            return Object.assign(Object.assign({}, post), { totalComments });
        }));
        const total = await this.postsService.countRecords(condition);
        const paginated = {
            total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: totalPosts,
        };
        return paginated;
    }
    async addLike(id, user) {
        const postExists = await this.postsService.findOneRecord({ _id: id, likes: { $in: [user._id] } });
        if (postExists)
            return await this.postsService.update({ _id: id }, { $pull: { likes: user._id } });
        const post = await this.postsService.update({ _id: id }, { $push: { likes: user._id } });
        if (user._id != post.creator._id.toString()) {
            await this.notificationService.createRecord({
                post: post._id,
                message: 'liked your post.',
                type: types_1.NotificationType.POST_LIKED,
                sender: user._id,
                receiver: post.creator._id,
            });
            if (post.creator.fcmToken) {
                await this.firebaseService.sendNotification({
                    token: post.creator.fcmToken,
                    notification: { title: `${user.firstName} ${user.lastName} liked your post.` },
                    data: { post: post._id.toString(), type: types_1.NotificationType.POST_LIKED },
                });
            }
        }
        return post;
    }
    async unLike(id, user) {
        return await this.postsService.update({ _id: id }, { $pull: { likes: user._id } });
    }
    async createComment(id, user, createCommentDto) {
        const post = await this.postsService.findOneRecord({ _id: id }).populate('creator');
        if (!post)
            throw new common_1.BadRequestException('Post does not exists.');
        let comment;
        if (createCommentDto.comment) {
            comment = await this.commentService.create(Object.assign({ creator: user._id, post: id }, createCommentDto));
            const updatedComment = await this.commentService
                .findOneRecordAndUpdate({ _id: createCommentDto.comment }, { $push: { replies: comment._id } })
                .populate('creator');
            await this.notificationService.createRecord({
                post: post._id,
                message: 'replied to you comment.',
                type: types_1.NotificationType.COMMENT_REPLIED,
                sender: user._id,
                receiver: updatedComment.creator._id,
            });
            await this.firebaseService.sendNotification({
                token: updatedComment.creator.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} replied to you comment.` },
                data: { post: post._id.toString(), type: types_1.NotificationType.COMMENT_REPLIED },
            });
        }
        else {
            comment = await this.commentService.create(Object.assign({ creator: user._id, post: id, root: true }, createCommentDto));
            await this.postsService.findOneRecordAndUpdate({ _id: id }, { $push: { comments: comment._id } });
            if (user._id != post.creator._id.toString()) {
                await this.notificationService.createRecord({
                    post: post._id,
                    message: 'commented on your post.',
                    type: types_1.NotificationType.POST_COMMENTED,
                    sender: user._id,
                    receiver: post.creator._id,
                });
                if (post.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: post.creator.fcmToken,
                        notification: { title: `${user.firstName} ${user.lastName} commented on your post.` },
                        data: { post: post._id.toString(), type: types_1.NotificationType.POST_COMMENTED },
                    });
                }
            }
        }
        return comment;
    }
    async findAllComments(id, { page, limit }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const condition = { post: id, root: true };
        const comments = await this.commentService.find(condition, options);
        const total = await this.commentService.countRecords({ post: id });
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: comments,
        };
        return paginated;
    }
    async updateComment(_a) {
        var { commentId, postId } = _a, rest = __rest(_a, ["commentId", "postId"]);
        return await this.commentService.update({ _id: commentId }, rest);
    }
    async isGroupModerator(postId, userId) {
        const post = await this.postsService.findOneRecord({ _id: postId });
        if (!post.group)
            return false;
        const moderator = await this.moderatorService.findOneRecord({ group: post.group, user: userId });
        if (!moderator)
            return false;
        else
            return moderator;
    }
    async deleteComment(id, postId, user) {
        const comment = await this.commentService.findOneRecord({ _id: id });
        if (!comment)
            throw new common_1.HttpException('Comment does not exist.', common_1.HttpStatus.BAD_REQUEST);
        if (comment.creator.toString() == user._id) {
            const deletedComment = await this.commentService.deleteSingleRecord({ _id: id });
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({ _id: deletedComment.comment }, { $pull: { replies: deletedComment._id } });
            }
            else {
                await this.postsService.findOneRecordAndUpdate({ _id: deletedComment.post }, { $pull: { comments: deletedComment._id } });
            }
            return { message: 'Comment deleted successfully.' };
        }
        else {
            const moderator = await this.isGroupModerator(postId, user._id);
            if (!moderator || !moderator.deleteComments)
                throw new common_1.UnauthorizedException();
            const deletedComment = await this.commentService.deleteSingleRecord({ _id: id });
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({ _id: deletedComment.comment }, { $pull: { replies: deletedComment._id } });
            }
            else {
                await this.postsService.findOneRecordAndUpdate({ _id: deletedComment.post }, { $pull: { comments: deletedComment._id } });
            }
            return { message: 'Comment deleted successfully.' };
        }
    }
    async update(updatePostDto, id) {
        return await this.postsService.update({ _id: id }, updatePostDto);
    }
    async block(id, block) {
        await this.postsService.findOneRecordAndUpdate({ _id: id }, { isBlocked: block === true ? true : false });
        return { message: `Post ${block === true ? 'blocked' : 'unblock'} successfully.` };
    }
    async pinUnpinPost(id, pinUnpinDto, user) {
        const post = await this.postsService.findOne({ _id: id });
        if (!post)
            throw new common_1.HttpException('Post does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (post.creator.toString() == user._id || user.role.includes(types_1.UserRoles.ADMIN)) {
            await this.postsService.findOneRecordAndUpdate({ _id: id }, pinUnpinDto);
        }
        else {
            const moderator = await this.isGroupModerator(id, user._id);
            if (!moderator || !moderator.pinPosts)
                throw new common_1.UnauthorizedException();
            await this.postsService.findOneRecordAndUpdate({ _id: id }, pinUnpinDto);
        }
        return { message: `Post ${pinUnpinDto.pin ? 'pin' : 'un pin'} successfully.` };
    }
    async featureUnFeature(id, featureUnFeatureDto) {
        const post = await this.postsService.findOne({ _id: id });
        if (!post)
            throw new common_1.BadRequestException('Post does not exists.');
        return await this.postsService.findOneRecordAndUpdate({ _id: id }, featureUnFeatureDto);
    }
    async addReactions(addReactionsDto, user) {
        if (addReactionsDto.comment) {
            const comment = await this.commentService.findOneRecord({ _id: addReactionsDto.comment }).populate('creator');
            if (!comment)
                throw new common_1.BadRequestException('Comment does not exist.');
            const reaction = await this.reactionService.create({ user: user._id, emoji: addReactionsDto.emoji, comment: comment._id });
            await this.commentService.findOneRecordAndUpdate({ _id: comment._id }, { $push: { reactions: reaction._id } });
            return reaction;
        }
        else {
            const post = await this.postsService.findOneRecord({ _id: addReactionsDto.post }).populate('creator');
            if (!post)
                throw new common_1.HttpException('Post does not exists', common_1.HttpStatus.BAD_REQUEST);
            const reaction = await this.reactionService.create({ user: user._id, emoji: addReactionsDto.emoji, post: post._id });
            await this.postsService.findOneRecordAndUpdate({ _id: post._id }, { $push: { reactions: reaction._id } });
            if (user._id != post.creator._id.toString()) {
                await this.notificationService.createRecord({
                    post: post._id,
                    message: 'reacted to your post.',
                    type: types_1.NotificationType.POST_REACTED,
                    sender: user._id,
                    receiver: post.creator._id,
                });
                if (post.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: post.creator.fcmToken,
                        notification: { title: `${user.firstName} ${user.lastName} reacted on your post.` },
                        data: { post: post._id.toString(), type: types_1.NotificationType.POST_REACTED },
                    });
                }
            }
            return reaction;
        }
    }
    async deleteReaction(id) {
        const reaction = await this.reactionService.deleteSingleRecord({ _id: id });
        if (!reaction)
            throw new common_1.HttpException('Reaction does not exists', common_1.HttpStatus.BAD_REQUEST);
        if (reaction.post)
            await this.postsService.findOneRecordAndUpdate({ _id: reaction.post }, { $pull: { reactions: reaction._id } });
        else if (reaction.comment)
            await this.commentService.findOneRecordAndUpdate({ _id: reaction.comment }, { $pull: { reactions: reaction._id } });
        return reaction;
    }
    async updateReaction(id, updateReactionsDto) {
        return await this.reactionService.update({ _id: id }, { emoji: updateReactionsDto.emoji });
    }
    async findTaggedPosts(user) {
        return await this.postsService.find({ tagged: { $in: [user._id] } }, { sort: { createdAt: -1 } });
    }
    async findPostAssets(user, type) {
        const condition = { creator: user._id };
        return await this.postsService.findPostMedia(condition, type);
    }
    async findEngagedPosts({ limit, page, filter }, user) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        let posts = [];
        let total = 0;
        if (filter === types_1.EngagedPostFilter.ALL) {
            const comments = (await this.commentService.findAllRecords({ creator: user._id }).select('_id')).map((comment) => comment._id);
            const reactions = (await this.reactionService.findAllRecords({ user: user._id }).select('_id')).map((reaction) => reaction._id);
            const condition = { $or: [{ reactions: { $in: [reactions] } }, { comments: { $in: comments } }] };
            posts = await this.postsService.find(condition, options);
            total = await this.postsService.countRecords(condition);
        }
        else if (filter === types_1.EngagedPostFilter.LIKED) {
            const reactions = (await this.reactionService.findAllRecords({ user: user._id }).select('_id')).map((reaction) => reaction._id);
            const condition = { $or: [{ reactions: { $in: [reactions] } }] };
            posts = await this.postsService.find(condition);
            total = await this.postsService.countRecords(condition);
        }
        else if (filter === types_1.EngagedPostFilter.COMMENTED) {
            const comments = (await this.commentService.findAllRecords({ creator: user._id }).select('_id')).map((comment) => comment._id);
            const condition = { comments: { $in: comments } };
            posts = await this.postsService.find(condition);
            total = await this.postsService.countRecords(condition);
        }
        return {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
    }
};
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Get)('find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_post_query_dto_1.FindAllPostQuery]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/find-one'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('find-all/user/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findUserPost", null);
__decorate([
    (0, common_1.Get)('home'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_home_post_query_dto_1.FindHomePostQueryDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findHomePosts", null);
__decorate([
    (0, common_1.Post)('like/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "addLike", null);
__decorate([
    (0, common_1.Put)('un-like/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "unLike", null);
__decorate([
    (0, common_1.Post)('comment/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(':id/comment/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, find_all_comments_query_dto_1.FindAllCommentQueryDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findAllComments", null);
__decorate([
    (0, common_1.Put)('comment/update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_comment_dto_1.UpdateCommentDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)(':postId/comment/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Param)('postId', helpers_1.ParseObjectId)),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Put)(':id/update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_post_dto_1.UpdatePostDto, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "update", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Put)(':id/block-unblock'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Query)('block', common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "block", null);
__decorate([
    (0, common_1.Put)(':id/pin-unpin'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pin_unpin_post_dto_1.PinUnpinDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "pinUnpinPost", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Put)(':id/feature-unfeature'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, feature_unfeature_dto_1.FeatureUnFeatureDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "featureUnFeature", null);
__decorate([
    (0, common_1.Post)('reaction/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_reactions_dto_1.AddReactionsDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "addReactions", null);
__decorate([
    (0, common_1.Delete)('reaction/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "deleteReaction", null);
__decorate([
    (0, common_1.Put)('reaction/:id/update'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reaction_dto_1.UpdateReactionsDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateReaction", null);
__decorate([
    (0, common_1.Get)('tagged/find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findTaggedPosts", null);
__decorate([
    (0, common_1.Get)('media'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findPostAssets", null);
__decorate([
    (0, common_1.Get)('engaged/find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_engaged_posts_query_dto_1.FindEngagedPostQuery, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findEngagedPosts", null);
PostsController = __decorate([
    (0, common_1.Controller)('post'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RolesGuard),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        users_service_1.UsersService,
        comment_service_1.CommentService,
        firebase_service_1.FirebaseService,
        notification_service_1.NotificationService,
        reaction_service_1.ReactionService,
        group_service_1.GroupService,
        moderator_service_1.ModeratorService,
        report_service_1.ReportService])
], PostsController);
exports.PostsController = PostsController;
//# sourceMappingURL=posts.controller.js.map