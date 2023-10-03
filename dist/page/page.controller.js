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
exports.PageController = void 0;
const common_1 = require("@nestjs/common");
const page_service_1 = require("./page.service");
const create_page_dto_1 = require("./dto/create-page.dto");
const update_page_dto_1 = require("./dto/update-page.dto");
const helpers_1 = require("../helpers");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const posts_service_1 = require("../posts/posts.service");
const find_all_pages_query_dto_1 = require("./dto/find-all-pages.query.dto");
const types_1 = require("../types");
const invitation_service_1 = require("./invitation.service");
const notification_service_1 = require("../notification/notification.service");
const firebase_service_1 = require("../firebase/firebase.service");
const create_invitation_dto_1 = require("./dto/create-invitation.dto");
const moderator_service_1 = require("./moderator.service");
const create_page_moderator_dto_1 = require("./dto/create-page-moderator.dto");
const update_page_moderator_dto_1 = require("./dto/update-page-moderator.dto");
const users_service_1 = require("../users/users.service");
const create_comment_1 = require("../posts/dtos/create-comment");
const find_all_comments_query_dto_1 = require("../posts/dtos/find-all-comments.query.dto");
const reaction_service_1 = require("./reaction.service");
const comment_service_1 = require("./comment.service");
const add_reactions_dto_1 = require("../posts/dtos/add-reactions.dto");
const update_reaction_dto_1 = require("../posts/dtos/update-reaction.dto");
const update_comment_dto_1 = require("./dto/update-comment.dto");
let PageController = class PageController {
    constructor(pageService, postService, invitationService, notificationService, firebaseService, moderatorService, usersService, commentService, reactionService, socketService) {
        this.pageService = pageService;
        this.postService = postService;
        this.invitationService = invitationService;
        this.notificationService = notificationService;
        this.firebaseService = firebaseService;
        this.moderatorService = moderatorService;
        this.usersService = usersService;
        this.commentService = commentService;
        this.reactionService = reactionService;
        this.socketService = socketService;
    }
    async create(createPageDto, user) {
        return await this.pageService.createRecord(Object.assign(Object.assign({}, createPageDto), { creator: user._id }));
    }
    async updateComment(_a) {
        var { commentId, pageId } = _a, rest = __rest(_a, ["commentId", "pageId"]);
        return await this.commentService.update({ _id: commentId }, rest);
    }
    async findOne(id) {
        return await this.pageService.findOneRecord({ _id: id })
            .populate({ path: 'moderators.user', select: 'firstName lastName avatar' })
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage");
    }
    async update(id, updatePageDto) {
        return await this.pageService.findOneRecordAndUpdate({ _id: id }, updatePageDto);
    }
    async findAll({ filter, query, limit, page, created, moderating, following }, user) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { limit: $q.limit, sort: $q.sort };
        let multipleQuery = [];
        if (created) {
            multipleQuery.push({ creator: user._id });
        }
        if (moderating) {
            multipleQuery.push({ 'moderators.user': { $in: [user._id] } });
        }
        if (following) {
            multipleQuery.push({ 'followers.follower': { $in: [user._id] } });
        }
        if (filter === types_1.PageFilter.ALL) {
            const condition = { name: { $regex: query, $options: 'i' }, creator: { $ne: user._id } };
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }
        if (filter === types_1.PageFilter.POPULAR) {
            const condition = { name: { $regex: query, $options: 'i' }, creator: { $ne: user._id } };
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }
        if (filter === types_1.PageFilter.LATEST) {
            const condition = { name: { $regex: query, $options: 'i' }, creator: { $ne: user._id } };
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }
        if (filter === types_1.PageFilter.SUGGESTED) {
            const condition = { name: { $regex: query, $options: 'i' }, creator: { $ne: user._id } };
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }
        if (multipleQuery.length > 0) {
            const condition = { $or: multipleQuery };
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options)
                .populate("moderators.user", "firstName lastName avatar")
                .populate("moderators.moderator", "createPost engageAsPage deletePage editPage");
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }
    }
    async findUserPages(id, { page, limit }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const condition = { creator: id };
        const options = { sort: $q.sort, limit: $q.limit, skip: $q.skip };
        const total = await this.pageService.countRecords(condition);
        const pages = await this.pageService.findAllRecords(condition, options);
        const paginated = {
            total,
            pages: Math.round(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: pages,
        };
        return paginated;
    }
    async follow(id, user) {
        const page = await this.pageService.findOneRecord({ _id: id })
            .populate("creator");
        if (!page)
            throw new common_1.BadRequestException('Page does not exists.');
        const followerFound = page.followers.find((follower) => follower.follower.equals(user._id));
        if (followerFound)
            throw new common_1.BadRequestException('You are already a follower of this page.');
        await this.notificationService.createRecord({
            type: types_1.NotificationType.PAGE_FOLLOW_ACCEPTED,
            page: id,
            message: `${user.firstName} ${user.lastName} has started following the ${page.name} page`,
            sender: user._id,
            receiver: page.creator._id
        });
        await this.firebaseService.sendNotification({
            token: page.creator.fcmToken,
            notification: { title: `${user.firstName} ${user.lastName} has started following the ${page.name} page` },
            data: { page: id.toString(), type: types_1.NotificationType.PAGE_FOLLOW_ACCEPTED },
        });
        return await this.pageService.findOneRecordAndUpdate({ _id: id }, { $push: { followers: { follower: user._id } } });
    }
    async unFollow(user, id) {
        return await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { followers: { follower: user._id } } });
    }
    async findAllfollowedPages(user) {
        return await this.pageService.findAllRecords({ 'followers.follower': user._id }).populate('creator');
    }
    async feed(user, { page, limit }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { sort: Object.assign({ pin: -1 }, $q.sort), limit: $q.limit, skip: $q.skip };
        const pages = (await this.pageService.findAllRecords({ 'followers.follower': user._id })).map((follower) => follower._id);
        const condition = { page: { $in: pages }, creator: { $nin: user.blockedUsers } };
        const posts = await this.postService.find(condition, options);
        const total = await this.postService.countRecords(condition);
        const paginated = {
            total,
            pages: Math.floor(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }
    async findAllFollowers(id) {
        return await this.pageService.findAllFollowers({ _id: id });
    }
    async findPostsOfPage(id, { limit, page }, user) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { sort: Object.assign({ feature: -1, pin: -1 }, $q.sort), limit: $q.limit, skip: $q.skip };
        const condition = { page: id, creator: { $nin: user.blockedUsers } };
        const posts = await this.postService.find(condition, options);
        const total = await this.postService.countRecords(condition);
        const paginated = {
            total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }
    async remove(id, user) {
        const page = await this.pageService.findOneRecord({ _id: id });
        if (!page)
            throw new common_1.BadRequestException('Page does not exist.');
        if (page.creator.toString() != user._id)
            throw new common_1.BadRequestException('You cannot delete this page.');
        await this.pageService.deleteSingleRecord({ _id: page._id });
        await this.postService.deleteManyRecord({ page: page._id });
        return page;
    }
    async createModerator(createModeratorDto, user) {
        const page = await this.pageService.findOneRecord({ _id: createModeratorDto.page });
        const moderator = await this.usersService.findOne({ _id: createModeratorDto.user });
        if (!page)
            throw new common_1.HttpException('Moderator does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (!page)
            throw new common_1.HttpException('Page does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (page.moderators.includes(createModeratorDto.user))
            throw new common_1.BadRequestException('This moderator already exists in this page.');
        if (page.creator.toString() != user._id)
            throw new common_1.UnauthorizedException();
        const saveModerator = await this.moderatorService.create(createModeratorDto);
        await this.pageService.findOneRecordAndUpdate({ _id: createModeratorDto.page }, { $push: { moderators: { user: createModeratorDto.user, moderator: moderator._id } } });
        await this.notificationService.createRecord({
            type: types_1.NotificationType.PAGE_MODERATOR,
            page: page._id,
            message: `${user.firstName} ${user.lastName} has added you as moderator.`,
            sender: user._id,
            receiver: createModeratorDto.user
        });
        await this.firebaseService.sendNotification({
            token: moderator.fcmToken,
            notification: { title: `${user.firstName} ${user.lastName} has added you as moderator.` },
            data: { page: createModeratorDto.page, type: types_1.NotificationType.PAGE_MODERATOR },
        });
        return saveModerator;
    }
    async findAllModerator(id) {
        return await this.moderatorService.find({ page: id });
    }
    async deleteModerator(id, user) {
        const moderator = await this.moderatorService.findOneRecord({ _id: id }).populate('page');
        if (!moderator)
            throw new common_1.HttpException('Moderator does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (moderator.user.toString() == user._id || moderator.page.creator.toString() == user._id) {
            await this.moderatorService.deleteSingleRecord({ _id: id });
            await this.pageService.findOneRecordAndUpdate({ _id: moderator.page }, { $pull: { moderators: moderator._id } });
            return moderator;
        }
        else
            throw new common_1.ForbiddenException();
    }
    async updateModerator(id, updateModeratorDto, user) {
        const moderator = await this.moderatorService.findOneRecord({ _id: id }).populate('page');
        if (!moderator)
            throw new common_1.BadRequestException('Moderator does not exists.');
        if (moderator.user.toString() == user._id || moderator.page.creator.toString() == user._id)
            return await this.moderatorService.findOneRecordAndUpdate({ _id: id }, updateModeratorDto).populate('user');
        else
            throw new common_1.ForbiddenException();
    }
    async createInvitation({ friend, page }, user) {
        const invitationFound = await this.invitationService.findOneRecord({ user: user._id, page, friend });
        if (invitationFound)
            throw new common_1.BadRequestException('Page invitation request already exists.');
        const invitation = await this.invitationService.create({ user: user._id, page, friend });
        console.log();
        await this.notificationService.createRecord({
            type: types_1.NotificationType.PAGE_INVITATION,
            page: invitation.page._id,
            message: `has sent you a page invitation request.`,
            sender: user._id,
            receiver: invitation.friend._id,
            invitation: invitation._id
        });
        await this.firebaseService.sendNotification({
            token: invitation.friend.fcmToken,
            notification: { title: `${user.firstName} ${user.lastName} has sent you a page invitation request.` },
            data: { page: invitation.page._id.toString(), type: types_1.NotificationType.PAGE_INVITATION,
                invitation: (invitation._id).toString() },
        });
        return invitation;
    }
    async findAllInvitations(user) {
        return await this.invitationService.find({ friend: user._id });
    }
    async acceptRejectInvitations(isApproved, id, user) {
        let invitation = await this.invitationService.findOne({ _id: id });
        if (!invitation)
            throw new common_1.BadRequestException('Page invitation does not exists.');
        await this.invitationService.deleteSingleRecord({ _id: id });
        if (isApproved) {
            await this.notificationService.createRecord({
                type: types_1.NotificationType.PAGE_FOLLOW_ACCEPTED,
                page: invitation.page._id,
                message: `${user.firstName} ${user.lastName} has accepted the ${invitation.page.name} page follow request`,
                sender: user._id,
                receiver: invitation.user._id,
                invitation: invitation._id
            });
            await this.firebaseService.sendNotification({
                token: invitation.user.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} has accepted the ${invitation.page.name} page follow request` },
                data: { page: invitation.page._id.toString(), type: types_1.NotificationType.PAGE_FOLLOW_ACCEPTED,
                    invitation: invitation._id.toString() },
            });
            const page = await this.pageService.findOneRecordAndUpdate({ _id: invitation.page._id }, { $pull: { requests: user._id }, $push: { followers: { follower: user._id } } });
            invitation.page = page;
        }
        return invitation;
    }
    async approveRejectRequest(isApproved, id, userId, user) {
        const page = await this.pageService.findOneRecord({ _id: id });
        if (!page)
            throw new common_1.HttpException('Page does not exist.', common_1.HttpStatus.BAD_REQUEST);
        if (page.creator.toString() == user._id) {
            if (isApproved) {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { followers: { follower: userId } } });
                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join page is approved`,
                    type: types_1.NotificationType.PAGE_JOIN_REQUEST_APPROVED,
                });
                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join page is approved` },
                        data: { page: page._id.toString(), type: types_1.NotificationType.PAGE_JOIN_REQUEST_APPROVED },
                    });
                }
                return 'Request approved successfully.';
            }
            else {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join page is rejected`,
                    type: types_1.NotificationType.PAGE_JOIN_REQUEST_REJECTED,
                });
                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join page is rejected` },
                        data: { page: page._id.toString(), type: types_1.NotificationType.PAGE_JOIN_REQUEST_REJECTED },
                    });
                }
                return 'Request rejected successfully.';
            }
        }
        else {
            const moderator = await this.moderatorService.findOneRecord({ group: id, user: user._id });
            if (!moderator)
                throw new common_1.UnauthorizedException();
            if (isApproved) {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { followers: { follower: userId } } });
                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join page is approved`,
                    type: types_1.NotificationType.PAGE_JOIN_REQUEST_APPROVED,
                });
                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join page is approved` },
                        data: { page: page._id.toString(), type: types_1.NotificationType.PAGE_JOIN_REQUEST_APPROVED },
                    });
                }
                return 'Request approved successfully.';
            }
            else {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join page is rejected`,
                    type: types_1.NotificationType.PAGE_JOIN_REQUEST_REJECTED,
                });
                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join page is rejected` },
                        data: { page: page._id.toString(), type: types_1.NotificationType.PAGE_JOIN_REQUEST_REJECTED },
                    });
                }
                return 'Request rejected successfully.';
            }
        }
    }
    async createComment(id, user, createCommentDto) {
        const page = await this.pageService.findOneRecord({ _id: id }).populate('creator');
        if (!page)
            throw new common_1.BadRequestException('Page does not exists.');
        let comment;
        if (createCommentDto.comment) {
            comment = await this.commentService.create(Object.assign({ creator: user._id, post: id }, createCommentDto));
            const updatedComment = await this.commentService
                .findOneRecordAndUpdate({ _id: createCommentDto.comment }, { $push: { replies: comment._id } })
                .populate('creator');
            await this.notificationService.createRecord({
                page: page._id,
                message: 'replied to you comment.',
                type: types_1.NotificationType.COMMENT_REPLIED,
                sender: user._id,
                receiver: updatedComment.creator._id,
            });
            await this.firebaseService.sendNotification({
                token: updatedComment.creator.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} replied to you comment.` },
                data: { page: page._id.toString(), type: types_1.NotificationType.COMMENT_REPLIED },
            });
            this.socketService.triggerMessage(`page-comment-reply-${(page._id).toString()}`, comment);
        }
        else {
            comment = await this.commentService.create(Object.assign({ creator: user._id, post: id, root: true }, createCommentDto));
            await this.pageService.findOneRecordAndUpdate({ _id: id }, { $push: { comments: comment._id } });
            if (user._id != page.creator._id.toString()) {
                await this.notificationService.createRecord({
                    post: page._id,
                    message: 'commented on your page.',
                    type: types_1.NotificationType.PAGE_COMMENTED,
                    sender: user._id,
                    receiver: post.creator._id,
                });
                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `${user.firstName} ${user.lastName} commented on your post.` },
                        data: { post: page._id.toString(), type: types_1.NotificationType.PAGE_COMMENTED },
                    });
                }
                this.socketService.triggerMessage(`page-comment-${(page._id).toString()}`, comment);
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
    async deleteComment(id, pageId, user) {
        const comment = await this.commentService.findOneRecord({ _id: id });
        if (!comment)
            throw new common_1.HttpException('Comment does not exist.', common_1.HttpStatus.BAD_REQUEST);
        if (comment.creator.toString() == user._id) {
            const deletedComment = await this.commentService.deleteSingleRecord({ _id: id });
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({ _id: deletedComment.comment }, { $pull: { replies: deletedComment._id } });
            }
            else {
                await this.pageService.findOneRecordAndUpdate({ _id: deletedComment.page }, { $pull: { comments: deletedComment._id } });
            }
            return { message: 'Comment deleted successfully.' };
        }
        else {
            const page = await this.pageService.findOneRecord({ _id: comment.page });
            const moderator = (page.moderators).findIndex((moderator) => (moderator.user).toString() === (user._id).toString());
            if (moderator === -1)
                throw new common_1.UnauthorizedException();
            const deletedComment = await this.commentService.deleteSingleRecord({ _id: id });
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({ _id: deletedComment.comment }, { $pull: { replies: deletedComment._id } });
            }
            else {
                await this.pageService.findOneRecordAndUpdate({ _id: deletedComment.page }, { $pull: { comments: deletedComment._id } });
            }
            return { message: 'Comment deleted successfully.' };
        }
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
            const page = await this.pageService.findOneRecord({ _id: addReactionsDto.post }).populate('creator');
            if (!page)
                throw new common_1.HttpException('Page does not exists', common_1.HttpStatus.BAD_REQUEST);
            const reaction = await this.reactionService.create({ user: user._id, emoji: addReactionsDto.emoji, page: page._id });
            await this.pageService.findOneRecordAndUpdate({ _id: page._id }, { $push: { reactions: reaction._id } });
            if (user._id != post.creator._id.toString()) {
                await this.notificationService.createRecord({
                    page: page._id,
                    message: 'reacted to your page.',
                    type: types_1.NotificationType.PAGE_REACTED,
                    sender: user._id,
                    receiver: post.creator._id,
                });
                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `${user.firstName} ${user.lastName} reacted on your page.` },
                        data: { post: page._id.toString(), type: types_1.NotificationType.PAGE_REACTED },
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
        if (reaction.page)
            await this.pageService.findOneRecordAndUpdate({ _id: reaction.page }, { $pull: { reactions: reaction._id } });
        else if (reaction.comment)
            await this.commentService.findOneRecordAndUpdate({ _id: reaction.comment }, { $pull: { reactions: reaction._id } });
        return reaction;
    }
    async updateReaction(id, updateReactionsDto) {
        return await this.reactionService.update({ _id: id }, { emoji: updateReactionsDto.emoji });
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_1.CreatePageDto, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('comment/update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_comment_dto_1.UpdatePageCommentDto]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Get)(':id/find-one'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/update'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_page_dto_1.UpdatePageDto]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('/find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_pages_query_dto_1.FindAllPagesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('find-all/user/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, helpers_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findUserPages", null);
__decorate([
    (0, common_1.Put)(':id/follow'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "follow", null);
__decorate([
    (0, common_1.Put)(':id/un-follow'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "unFollow", null);
__decorate([
    (0, common_1.Get)('follow/find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findAllfollowedPages", null);
__decorate([
    (0, common_1.Get)('follow/post/find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, helpers_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "feed", null);
__decorate([
    (0, common_1.Get)(':id/follower/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findAllFollowers", null);
__decorate([
    (0, common_1.Get)(':id/post/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, helpers_1.PaginationDto, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findPostsOfPage", null);
__decorate([
    (0, common_1.Delete)(':id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('moderator/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_moderator_dto_1.CreatePageModeratorDto, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "createModerator", null);
__decorate([
    (0, common_1.Get)(':id/moderator/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findAllModerator", null);
__decorate([
    (0, common_1.Delete)('moderator/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "deleteModerator", null);
__decorate([
    (0, common_1.Put)('moderator/:id/update'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_page_moderator_dto_1.UpdatePageModeratorDto, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "updateModerator", null);
__decorate([
    (0, common_1.Post)('invitation/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invitation_dto_1.CreateInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Get)('invitation/find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findAllInvitations", null);
__decorate([
    (0, common_1.Put)('invitation/:id/accept-reject'),
    __param(0, (0, common_1.Body)('isApproved', new common_1.ParseBoolPipe())),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(2, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "acceptRejectInvitations", null);
__decorate([
    (0, common_1.Put)('request/:id/:userId'),
    __param(0, (0, common_1.Query)('isApproved', new common_1.ParseBoolPipe())),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(2, (0, common_1.Param)('userId', helpers_1.ParseObjectId)),
    __param(3, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, String, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "approveRejectRequest", null);
__decorate([
    (0, common_1.Post)('/:id/comment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, helpers_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(':id/comment/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, find_all_comments_query_dto_1.FindAllCommentQueryDto]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "findAllComments", null);
__decorate([
    (0, common_1.Delete)(':pageId/comment/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Param)('pageId', helpers_1.ParseObjectId)),
    __param(2, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)('reaction/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_reactions_dto_1.AddReactionsDto, Object]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "addReactions", null);
__decorate([
    (0, common_1.Delete)('reaction/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "deleteReaction", null);
__decorate([
    (0, common_1.Put)('reaction/:id/update'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reaction_dto_1.UpdateReactionsDto]),
    __metadata("design:returntype", Promise)
], PageController.prototype, "updateReaction", null);
PageController = __decorate([
    (0, common_1.Controller)('page'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [page_service_1.PageService,
        posts_service_1.PostsService,
        invitation_service_1.PageInvitationService,
        notification_service_1.NotificationService,
        firebase_service_1.FirebaseService,
        moderator_service_1.PageModeratorService,
        users_service_1.UsersService,
        comment_service_1.PageCommentService,
        reaction_service_1.PageReactionService,
        helpers_1.SocketGateway])
], PageController);
exports.PageController = PageController;
//# sourceMappingURL=page.controller.js.map