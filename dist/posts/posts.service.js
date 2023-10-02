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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const types_1 = require("../types");
const posts_schema_1 = require("./posts.schema");
let PostsService = class PostsService extends base_service_1.BaseService {
    constructor(postModel) {
        super(postModel);
        this.postModel = postModel;
    }
    getPopulateFields() {
        return [
            {
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: [
                    { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                    { path: 'mentions', select: 'firstName lastName avatar' },
                ],
            },
            { path: 'likes', select: 'firstName lastName avatar fcmToken' },
            { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId fcmToken enableNotifications' },
            { path: 'group', select: 'name' },
            { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
            { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
            { path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications' },
            { path: 'mentions', select: 'firstName lastName avatar' },
            { path: 'page', select: 'name profilePhoto' },
            {
                path: 'sharedPost',
                populate: [
                    { path: 'creator', select: 'firstName lastName avatar' },
                    { path: 'group', select: 'name' },
                    { path: 'likes', select: 'firstName lastName avatar fcmToken' },
                    { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
                    { path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications' },
                ],
            },
        ];
    }
    getHomePostpopulateFields() {
        return [
            {
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: [
                    { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                    { path: 'mentions', select: 'firstName lastName avatar' },
                    {
                        path: 'replies',
                        options: { sort: { createdAt: -1 } },
                        populate: [
                            { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                            { path: 'mentions', select: 'firstName lastName avatar' },
                            {
                                path: 'replies',
                                options: { sort: { createdAt: -1 } },
                                populate: [
                                    { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                                    { path: 'mentions', select: 'firstName lastName avatar' },
                                    {
                                        path: 'replies',
                                        options: { sort: { createdAt: -1 } },
                                        populate: [
                                            { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                                            { path: 'mentions', select: 'firstName lastName avatar' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            { path: 'likes', select: 'firstName lastName avatar fcmToken' },
            { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId fcmToken enableNotifications' },
            { path: 'group', select: 'name' },
            { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
            { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
            { path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications' },
            { path: 'page', select: 'name profilePhoto' },
            {
                path: 'sharedPost',
                populate: [
                    { path: 'creator', select: 'firstName lastName avatar' },
                    { path: 'group', select: 'name' },
                    { path: 'likes', select: 'firstName lastName avatar fcmToken' },
                    { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
                    { path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications' },
                    { path: 'page', select: 'name profilePhoto' },
                ],
            },
            { path: 'mentions', select: 'firstName lastName avatar' },
        ];
    }
    async find(query, options) {
        const posts = await this.postModel.find(query, {}, options).populate(this.getPopulateFields()).lean();
        return posts.map((post) => (Object.assign(Object.assign({}, post), { totalComments: post.comments.length, comments: post.comments.slice(0, 3) })));
    }
    async findHomePosts(query, options) {
        const posts = await this.postModel.find(query, {}, options).populate(this.getHomePostpopulateFields()).lean();
        return posts.map((post) => (Object.assign(Object.assign({}, post), { comments: post.comments.slice(0, 3) })));
    }
    async update(query, updateQuery) {
        return await this.postModel.findOneAndUpdate(query, updateQuery, { new: true }).populate(this.getPopulateFields()).lean();
    }
    async createPost(query) {
        return (await this.postModel.create(query)).populate(this.getPopulateFields());
    }
    async findOne(query) {
        return await this.postModel.findOne(query).populate(this.getPopulateFields()).lean();
    }
    async FindAllFundraisingProjects(query, options) {
        return await this.postModel.find(query, {}, options).select('fundraising status').populate('fundraising').lean();
    }
    getHomePostSort(sort) {
        let sortOrder;
        if (sort === types_1.PostSort.MOST_RECENT)
            sortOrder = { createdAt: -1 };
        else if (sort === types_1.PostSort.RECENT_INTERACTIONS)
            sortOrder = { updatedAt: -1 };
        return Object.assign({ featured: -1, pin: -1 }, sortOrder);
    }
    async findPostMedia(query, type) {
        const posts = await this.postModel.find(query).select('images videos');
        if (type === types_1.MediaType.VIDEO) {
            let videos = [];
            posts.forEach((post) => {
                if (post.videos.length > 0)
                    videos = [...videos, ...post.videos];
            });
            return videos;
        }
        else if (type === types_1.MediaType.IMAGE) {
            let images = [];
            posts.forEach((post) => {
                if (post.images.length > 0)
                    images = [...images, ...post.images];
            });
            return images;
        }
    }
};
PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(posts_schema_1.Posts.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PostsService);
exports.PostsService = PostsService;
//# sourceMappingURL=posts.service.js.map