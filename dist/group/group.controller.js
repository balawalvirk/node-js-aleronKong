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
const fund_service_1 = require("../fundraising/fund.service");
const fundraising_service_1 = require("../fundraising/fundraising.service");
const notification_service_1 = require("../notification/notification.service");
const firebase_service_1 = require("../firebase/firebase.service");
const mute_group_dto_1 = require("./dto/mute-group.dto");
const findGroupPost_query_dto_1 = require("./dto/findGroupPost.query.dto");
const create_moderator_dto_1 = require("./dto/create-moderator.dto");
const moderator_service_1 = require("./moderator.service");
const update_moderator_dto_1 = require("./dto/update-moderator.dto");
const mute_service_1 = require("../mute/mute.service");
const find_all_query_dto_1 = require("./dto/find-all.query.dto");
const remove_member_dto_1 = require("./dto/remove-member.dto");
const ban_member_dto_1 = require("./dto/ban-member.dto");
const create_invitation_dto_1 = require("./dto/create-invitation.dto");
const invitation_service_1 = require("./invitation.service");
const report_service_1 = require("../report/report.service");
const page_service_1 = require("../page/page.service");
let GroupController = class GroupController {
    constructor(groupService, postService, fundraisingService, fundService, notificationService, firebaseService, moderatorService, muteService, invitationService, reportService, pageService) {
        this.groupService = groupService;
        this.postService = postService;
        this.fundraisingService = fundraisingService;
        this.fundService = fundService;
        this.notificationService = notificationService;
        this.firebaseService = firebaseService;
        this.moderatorService = moderatorService;
        this.muteService = muteService;
        this.invitationService = invitationService;
        this.reportService = reportService;
        this.pageService = pageService;
    }
    async create(createGroupDto, user) {
        const group = await this.groupService.findOneRecord({ name: createGroupDto.name });
        if (group)
            throw new common_1.BadRequestException('Group already exists with this name.');
        return await this.groupService.createRecord(Object.assign(Object.assign({}, createGroupDto), { creator: user._id }));
    }
    async createPost(createPostDto, user) {
        if (createPostDto.group) {
            const group = await this.groupService.findOneRecord({ _id: createPostDto.group });
            if (!group)
                throw new common_1.HttpException('Group does not exists.', common_1.HttpStatus.BAD_REQUEST);
            const member = group.members.find((member) => member.member.toString() == user._id);
            if (member === null || member === void 0 ? void 0 : member.banned)
                throw new common_1.HttpException('You are not allowed to create post.', common_1.HttpStatus.FORBIDDEN);
            const post = await this.postService.createPost(Object.assign(Object.assign({}, createPostDto), { privacy: types_1.PostPrivacy.GROUP, creator: user._id }));
            await this.groupService
                .findOneRecordAndUpdate({ _id: post.group }, { $push: { posts: post._id } })
                .populate({ path: 'creator', select: 'fcmToken' });
            if (user._id != group.creator._id.toString()) {
                await this.notificationService.createRecord({
                    type: types_1.NotificationType.NEW_GROUP_POST,
                    group: group._id,
                    message: `has posted in your ${group.name} group`,
                    sender: user._id,
                    receiver: group.creator._id,
                });
                const mute = await this.muteService.findOneRecord({ group: group._id, user: group.creator._id });
                if (!this.groupService.isGroupMuted(mute)) {
                    if (group.creator.fcmToken) {
                        await this.firebaseService.sendNotification({
                            token: group.creator.fcmToken,
                            notification: { title: `${user.firstName} ${user.lastName} has posted in your ${group.name} group` },
                            data: { group: group._id.toString(), type: types_1.NotificationType.NEW_GROUP_POST },
                        });
                    }
                }
            }
            return post;
        }
        else if (createPostDto.page) {
            const page = await this.pageService.findOneRecord({ _id: createPostDto.page });
            if (!page)
                throw new common_1.BadRequestException('Page does not exists.');
            const follower = page.followers.find((follower) => follower.follower.toString() == user._id);
            if (follower === null || follower === void 0 ? void 0 : follower.banned)
                throw new common_1.ForbiddenException('You are not allowed to create post.');
            const post = await this.postService.createPost(Object.assign(Object.assign({}, createPostDto), { privacy: types_1.PostPrivacy.PAGE, creator: user._id }));
            await this.pageService.findOneRecordAndUpdate({ _id: post.page }, { $push: { posts: post._id } });
            return post;
        }
        else {
            const post = await this.postService.createPost(Object.assign(Object.assign({}, createPostDto), { creator: user._id }));
            if (post.tagged) {
                for (const taggedUser of post.tagged) {
                    await this.notificationService.createRecord({
                        type: types_1.NotificationType.USER_TAGGED,
                        post: post._id,
                        message: `has tagged you in a post.`,
                        sender: user._id,
                        receiver: taggedUser._id,
                    });
                    if (taggedUser.enableNotifications) {
                        if (taggedUser.fcmToken) {
                            await this.firebaseService.sendNotification({
                                token: taggedUser.fcmToken,
                                notification: { title: `${user.firstName} ${user.lastName} has tagged you in post.` },
                                data: { post: post._id.toString(), type: types_1.NotificationType.USER_TAGGED },
                            });
                        }
                    }
                }
            }
            return post;
        }
    }
    async isGroupModerator(postId, userId) {
        const post = await this.postService.findOneRecord({ _id: postId });
        if (!post.group)
            return false;
        const moderator = await this.moderatorService.findOneRecord({ group: post.group, user: userId });
        if (!moderator)
            return false;
        else
            return moderator;
    }
    async deletePost(id, user) {
        const post = await this.postService.findOneRecord({ _id: id });
        if (!post)
            throw new common_1.HttpException('Post does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (post.creator.toString() == user._id) {
            const deletedPost = await this.postService.deleteSingleRecord({ _id: id });
            if (deletedPost.group)
                await this.groupService.findOneRecordAndUpdate({ _id: deletedPost.group }, { $pull: { posts: deletedPost._id } });
            if (deletedPost.type === types_1.PostType.FUNDRAISING) {
                await this.fundraisingService.deleteSingleRecord({ _id: deletedPost.fundraising });
                await this.fundService.deleteManyRecord({ project: deletedPost.fundraising });
            }
        }
        else {
            const moderator = await this.isGroupModerator(post._id, user._id);
            if (!moderator || !moderator.deletePosts)
                throw new common_1.UnauthorizedException();
            const deletedPost = await this.postService.deleteSingleRecord({ _id: id });
            if (deletedPost.group)
                await this.groupService.findOneRecordAndUpdate({ _id: deletedPost.group }, { $pull: { posts: deletedPost._id } });
            if (deletedPost.type === types_1.PostType.FUNDRAISING) {
                await this.fundraisingService.deleteSingleRecord({ _id: deletedPost.fundraising });
                await this.fundService.deleteManyRecord({ project: deletedPost.fundraising });
            }
        }
        return { message: 'Post deleted successfully.' };
    }
    async feed(user, page, limit) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { sort: Object.assign({ pin: -1 }, $q.sort), limit: $q.limit, skip: $q.skip };
        const groups = (await this.groupService.findAllRecords({ 'members.member': user._id })).map((group) => group._id);
        const condition = { group: { $in: groups }, creator: { $nin: user.blockedUsers } };
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
    async findOne(id) {
        return await this.groupService.findOneRecord({ _id: id }).populate([{ path: 'mutes' }, { path: 'moderators' }]);
    }
    async update(id, updateGroupDto) {
        const group = await this.groupService.findOneRecord({ _id: id });
        if (!group)
            throw new common_1.BadRequestException('Group does not exists.');
        const GroupWithName = await this.groupService.findOneRecord({ _id: { $ne: group._id }, name: updateGroupDto.name });
        if (GroupWithName)
            throw new common_1.BadRequestException('A group with this name aleady exists.');
        return await this.groupService.findOneRecordAndUpdate({ _id: id }, updateGroupDto);
    }
    async joinGroup(user, id) {
        const group = await this.groupService.findOneRecord({ _id: id }).populate({ path: 'creator', select: 'fcmToken' });
        if (!group)
            throw new common_1.HttpException('Group does not exists.', common_1.HttpStatus.BAD_REQUEST);
        const memberFound = group.members.filter((member) => member.member === user._id);
        if (memberFound.length > 0)
            throw new common_1.HttpException('You are already a member of this group.', common_1.HttpStatus.BAD_REQUEST);
        if (group.privacy === types_1.GroupPrivacy.PRIVATE) {
            const requestFound = group.requests.filter((request) => request === user._id);
            if (requestFound.length > 0)
                throw new common_1.HttpException('Your request to join group is pending.', common_1.HttpStatus.BAD_REQUEST);
            await this.notificationService.createRecord({
                type: types_1.NotificationType.GROUP_JOIN_REQUEST,
                group: group._id,
                message: `has send a join request for ${group.name} group`,
                sender: user._id,
                receiver: group.creator._id,
            });
            if (group.creator.fcmToken) {
                await this.firebaseService.sendNotification({
                    token: group.creator.fcmToken,
                    notification: { title: `${user.firstName} ${user.lastName} has send a join request for ${group.name} group` },
                    data: { group: group._id.toString(), type: types_1.NotificationType.GROUP_JOIN_REQUEST },
                });
            }
            return await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { requests: user._id } });
        }
        await this.notificationService.createRecord({
            type: types_1.NotificationType.GROUP_JOINED,
            group: group._id,
            message: `has joined your ${group.name} group`,
            sender: user._id,
            receiver: group.creator._id,
        });
        const updatedGroup = await this.groupService.findOneRecordAndUpdate({ _id: id }, { $push: { members: { member: user._id } } });
        if (group.creator.fcmToken) {
            await this.firebaseService.sendNotification({
                token: group.creator.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} has joined your ${group.name} group` },
                data: { group: group._id.toString(), type: types_1.NotificationType.GROUP_JOINED },
            });
        }
        return updatedGroup;
    }
    async leaveGroup(user, id) {
        await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { members: { member: user._id } } });
        return 'Group left successfully.';
    }
    async remove(id, user) {
        const group = await this.groupService.findOneRecord({ _id: id });
        if (!group)
            throw new common_1.HttpException('Group does not exist', common_1.HttpStatus.BAD_REQUEST);
        if (group.creator.toString() != user._id)
            throw new common_1.HttpException('You cannot delete this group', common_1.HttpStatus.UNAUTHORIZED);
        await this.groupService.deleteSingleRecord({ _id: group._id });
        await this.postService.deleteManyRecord({ group: group._id });
        return 'Group deleted successfully.';
    }
    async findAllMembers(id) {
        const group = await this.groupService.findAllMembers({ _id: id });
        return group.members;
    }
    async removeMember(removeMemberDto, user) {
        const group = await this.groupService.findOneRecord({ _id: removeMemberDto.group }).populate({ path: 'moderators', match: { user: user._id } });
        if (!group)
            throw new common_1.HttpException('Group does not exist.', common_1.HttpStatus.BAD_REQUEST);
        if (group.creator.toString() != user._id) {
            if (!group.moderators || group.moderators.length === 0 || !group.moderators[0].removeMembers)
                throw new common_1.HttpException('You cannot remove a member.', common_1.HttpStatus.FORBIDDEN);
        }
        const updatedGroup = await this.groupService.findOneRecordAndUpdate({ _id: removeMemberDto.group }, { $pull: { members: { member: removeMemberDto.member } } });
        return updatedGroup.members;
    }
    async banMember(banMemberDto, user) {
        const group = await this.groupService.findOneRecord({ _id: banMemberDto.group }).populate({ path: 'moderators', match: { user: user._id } });
        if (!group)
            throw new common_1.HttpException('Group does not exist.', common_1.HttpStatus.BAD_REQUEST);
        if (group.creator.toString() != user._id) {
            if (!group.moderators || group.moderators.length === 0 || !group.moderators[0].banMembers)
                throw new common_1.HttpException('You cannot ban a member.', common_1.HttpStatus.FORBIDDEN);
        }
        const updatedGroup = await this.groupService.findOneRecordAndUpdate({ _id: banMemberDto.group, 'members.member': banMemberDto.member }, { $set: { 'members.$.banned': true } });
        return updatedGroup.members;
    }
    async unBanMember(unBanMemberDto, user) {
        const group = await this.groupService.findOneRecord({ _id: unBanMemberDto.group }).populate({ path: 'moderators', match: { user: user._id } });
        if (!group)
            throw new common_1.HttpException('Group does not exist.', common_1.HttpStatus.BAD_REQUEST);
        if (group.creator.toString() != user._id) {
            if (!group.moderators || group.moderators.length === 0 || !group.moderators[0].banMembers)
                throw new common_1.HttpException('You are not allowed to un ban a member.', common_1.HttpStatus.FORBIDDEN);
        }
        const updatedGroup = await this.groupService.findOneRecordAndUpdate({ _id: unBanMemberDto.group, 'members.member': unBanMemberDto.member }, { $set: { 'members.$.banned': false } });
        return updatedGroup.members;
    }
    async findAllRequests(id) {
        const group = await this.groupService.findAllRequests({ _id: id });
        if (!group.requests)
            return [];
        return group.requests;
    }
    async approveRejectRequest(isApproved, id, userId, user) {
        const group = await this.groupService.findOneRecord({ _id: id });
        if (!group)
            throw new common_1.HttpException('Group does not exist.', common_1.HttpStatus.BAD_REQUEST);
        if (group.creator.toString() == user._id) {
            if (isApproved) {
                await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });
                await this.notificationService.createRecord({
                    group: group._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join group is approved`,
                    type: types_1.NotificationType.GROUP_JOIN_REQUEST_APPROVED,
                });
                if (group.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: group.creator.fcmToken,
                        notification: { title: `Your request to join group is approved` },
                        data: { group: group._id.toString(), type: types_1.NotificationType.GROUP_JOIN_REQUEST_APPROVED },
                    });
                }
                return 'Request approved successfully.';
            }
            else {
                await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
                await this.notificationService.createRecord({
                    group: group._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join group is rejected`,
                    type: types_1.NotificationType.GROUP_JOIN_REQUEST_REJECTED,
                });
                if (group.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: group.creator.fcmToken,
                        notification: { title: `Your request to join group is rejected` },
                        data: { group: group._id.toString(), type: types_1.NotificationType.GROUP_JOIN_REQUEST_REJECTED },
                    });
                }
                return 'Request rejected successfully.';
            }
        }
        else {
            const moderator = await this.moderatorService.findOneRecord({ group: id, user: user._id });
            if (!moderator || !moderator.acceptMemberRequests)
                throw new common_1.UnauthorizedException();
            if (isApproved) {
                await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });
                await this.notificationService.createRecord({
                    group: group._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join group is approved`,
                    type: types_1.NotificationType.GROUP_JOIN_REQUEST_APPROVED,
                });
                if (group.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: group.creator.fcmToken,
                        notification: { title: `Your request to join group is approved` },
                        data: { group: group._id.toString(), type: types_1.NotificationType.GROUP_JOIN_REQUEST_APPROVED },
                    });
                }
                return 'Request approved successfully.';
            }
            else {
                await this.groupService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
                await this.notificationService.createRecord({
                    group: group._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join group is rejected`,
                    type: types_1.NotificationType.GROUP_JOIN_REQUEST_REJECTED,
                });
                if (group.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: group.creator.fcmToken,
                        notification: { title: `Your request to join group is rejected` },
                        data: { group: group._id.toString(), type: types_1.NotificationType.GROUP_JOIN_REQUEST_REJECTED },
                    });
                }
                return 'Request rejected successfully.';
            }
        }
    }
    async findAllGroups({ type, query, limit, page }, user) {
        if (type) {
            const $q = (0, helpers_1.makeQuery)({ page, limit });
            const options = { limit: $q.limit, sort: $q.sort };
            let allGroups = [];
            if (type.includes('forYou')) {
                const reports = await this.reportService.findAllRecords({ reporter: user._id, type: types_1.ReportType.GROUP });
                const reportedGroups = reports.map((report) => report.group);
                const groups = await this.groupService.findAllRecords({ name: { $regex: query, $options: 'i' }, 'members.member': user._id, _id: { $nin: reportedGroups } }, options);
                allGroups = [...allGroups, ...groups];
            }
            if (type.includes('yourGroups')) {
                const groups = await this.groupService.findAllRecords({
                    $and: [{ name: { $regex: query, $options: 'i' } }, { creator: user._id }],
                }, options);
                allGroups = [...allGroups, ...groups];
            }
            if (type.includes('discover')) {
                const groups = await this.groupService.findAllRecords({
                    $and: [{ name: { $regex: query, $options: 'i' } }, { 'members.member': { $ne: user._id }, creator: { $ne: user._id } }],
                }, options);
                allGroups = [...allGroups, ...groups];
            }
            if (type.includes('moderating')) {
                const groupIds = (await this.moderatorService.findAllRecords({ user: user._id })).map((moderator) => moderator.group);
                const groups = await this.groupService.findAllRecords({ _id: { $in: groupIds } }, options);
                allGroups = [...allGroups, ...groups];
            }
            return allGroups;
        }
        else {
            return await this.groupService.findAllRecords();
        }
    }
    async muteGroup(muteGroupDto, user) {
        const now = new Date();
        const date = new Date(now);
        let updatedObj = { user: user._id, interval: muteGroupDto.interval, group: muteGroupDto.group };
        if (muteGroupDto.interval === types_1.MuteInterval.DAY) {
            date.setDate(now.getDate() + 1);
        }
        else if (muteGroupDto.interval === types_1.MuteInterval.WEEK) {
            date.setDate(now.getDate() + 7);
        }
        date.toLocaleDateString();
        const muteFound = await this.muteService.findOneRecord({ user: user._id, group: muteGroupDto.group });
        if (muteFound) {
            const { user, group } = updatedObj, rest = __rest(updatedObj, ["user", "group"]);
            await this.muteService.findOneRecordAndUpdate({ _id: muteFound._id }, rest);
        }
        else {
            const mute = await this.muteService.createRecord(updatedObj);
            await this.groupService.findOneRecordAndUpdate({ _id: muteGroupDto.group }, { $push: { mutes: mute._id } });
        }
        return { message: 'Group muted successfully.' };
    }
    async unMute(id) {
        const mute = await this.muteService.deleteSingleRecord({ _id: id });
        if (!mute)
            throw new common_1.HttpException('Mute does not exists.', common_1.HttpStatus.BAD_REQUEST);
        await this.groupService.findOneRecordAndUpdate({ _id: mute.chat }, { $pull: { mutes: mute._id } });
        return mute;
    }
    async findPostsOfGroups(id, { limit, page }, user) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { sort: Object.assign({ feature: -1, pin: -1 }, $q.sort), limit: $q.limit, skip: $q.skip };
        const condition = { group: id, creator: { $nin: user.blockedUsers } };
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
    async createModerator(createModeratorDto, user) {
        const group = await this.groupService.findOneRecord({ _id: createModeratorDto.group });
        if (!group)
            throw new common_1.HttpException('Group does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (group.moderators.includes(createModeratorDto.user))
            throw new common_1.BadRequestException('This moderator already exists in this group.');
        if (group.creator.toString() != user._id)
            throw new common_1.UnauthorizedException();
        const moderator = await this.moderatorService.create(createModeratorDto);
        await this.groupService.findOneRecordAndUpdate({ _id: createModeratorDto.group }, { $push: { moderators: moderator._id } });
        return moderator;
    }
    async findAllModerator(id) {
        return await this.moderatorService.find({ group: id });
    }
    async deleteModerator(id, user) {
        const moderator = await this.moderatorService.findOneRecord({ _id: id }).populate('group');
        if (!moderator)
            throw new common_1.HttpException('Moderator does not exists.', common_1.HttpStatus.BAD_REQUEST);
        if (moderator.user.toString() == user._id || moderator.group.creator.toString() == user._id) {
            await this.moderatorService.deleteSingleRecord({ _id: id });
            await this.groupService.findOneRecordAndUpdate({ _id: moderator.group }, { $pull: { moderators: moderator._id } });
            return moderator;
        }
        else
            throw new common_1.ForbiddenException();
    }
    async updateModerator(id, updateModeratorDto, user) {
        const moderator = await this.moderatorService.findOneRecord({ _id: id }).populate('group');
        if (!moderator)
            throw new common_1.BadRequestException('Moderator does not exists.');
        if (moderator.user.toString() == user._id || moderator.group.creator.toString() == user._id)
            return await this.moderatorService.findOneRecordAndUpdate({ _id: id }, updateModeratorDto).populate('user');
        else
            throw new common_1.ForbiddenException();
    }
    async createInvitation({ friend, group }, user) {
        const invitationFound = await this.invitationService.findOneRecord({ user: user._id, group, friend });
        if (invitationFound)
            throw new common_1.BadRequestException('Group request already exists.');
        const invitation = await this.invitationService.create({ user: user._id, group, friend });
        await this.notificationService.createRecord({
            type: types_1.NotificationType.GROUP_INVITATION,
            group: invitation.group._id,
            message: `has sent you a group invitation request.`,
            sender: user._id,
            receiver: invitation.friend._id,
        });
        await this.firebaseService.sendNotification({
            token: invitation.friend.fcmToken,
            notification: { title: `${user.firstName} ${user.lastName} has sent you a group invitation request.` },
            data: { group: invitation.group._id.toString(), type: types_1.NotificationType.GROUP_INVITATION },
        });
        return invitation;
    }
    async findAllInvitations(user) {
        return await this.invitationService.find({ friend: user._id });
    }
    async acceptRejectInvitations(isApproved, id, user) {
        const invitation = await this.invitationService.findOne({ _id: id });
        if (!invitation)
            throw new common_1.BadRequestException('Group invitation does not exists.');
        await this.invitationService.deleteSingleRecord({ _id: id });
        if (isApproved) {
            await this.notificationService.createRecord({
                type: types_1.NotificationType.GROUP_JOIN_REQUEST,
                group: invitation.group._id,
                message: `has sent a join request for ${invitation.group.name} group`,
                sender: user._id,
                receiver: invitation.user,
            });
            await this.firebaseService.sendNotification({
                token: invitation.group.creator.fcmToken,
                notification: { title: `${user.firstName} ${user.lastName} has sent a join request for ${invitation.group.name} group` },
                data: { group: invitation.group._id.toString(), type: types_1.NotificationType.GROUP_JOIN_REQUEST },
            });
            await this.groupService.findOneRecordAndUpdate({ _id: invitation.group }, { $push: { requests: user._id } });
        }
        return invitation;
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
    (0, common_1.Delete)('post/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "feed", null);
__decorate([
    (0, common_1.Get)('find-one/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
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
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
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
    (0, common_1.Put)('remove-member'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [remove_member_dto_1.RemoveMemberDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Put)('ban-member'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ban_member_dto_1.BanMemberDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "banMember", null);
__decorate([
    (0, common_1.Put)('un-ban-member'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ban_member_dto_1.BanMemberDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "unBanMember", null);
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
    __param(3, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "approveRejectRequest", null);
__decorate([
    (0, common_1.Get)('find-all'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_query_dto_1.FindAllQueryDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAllGroups", null);
__decorate([
    (0, common_1.Put)('mute'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mute_group_dto_1.MuteGroupDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "muteGroup", null);
__decorate([
    (0, common_1.Put)(':id/un-mute'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "unMute", null);
__decorate([
    (0, common_1.Get)(':id/post/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, findGroupPost_query_dto_1.FindPostsOfGroupQueryDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findPostsOfGroups", null);
__decorate([
    (0, common_1.Post)('moderator/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_moderator_dto_1.CreateModeratorDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "createModerator", null);
__decorate([
    (0, common_1.Get)(':id/moderator/find-all'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAllModerator", null);
__decorate([
    (0, common_1.Delete)('moderator/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "deleteModerator", null);
__decorate([
    (0, common_1.Put)('moderator/:id/update'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_moderator_dto_1.UpdateModeratorDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "updateModerator", null);
__decorate([
    (0, common_1.Post)('invitation/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invitation_dto_1.CreateInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Get)('invitation/find-all'),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAllInvitations", null);
__decorate([
    (0, common_1.Put)('invitation/:id/accept-reject'),
    __param(0, (0, common_1.Body)('isApproved', new common_1.ParseBoolPipe())),
    __param(1, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "acceptRejectInvitations", null);
GroupController = __decorate([
    (0, common_1.Controller)('group'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [group_service_1.GroupService,
        posts_service_1.PostsService,
        fundraising_service_1.FundraisingService,
        fund_service_1.FundService,
        notification_service_1.NotificationService,
        firebase_service_1.FirebaseService,
        moderator_service_1.ModeratorService,
        mute_service_1.MuteService,
        invitation_service_1.GroupInvitationService,
        report_service_1.ReportService,
        page_service_1.PageService])
], GroupController);
exports.GroupController = GroupController;
//# sourceMappingURL=group.controller.js.map