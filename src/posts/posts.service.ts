import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import mongoose, {FilterQuery, Model, QueryOptions, UpdateQuery} from 'mongoose';
import {BaseService} from 'src/helpers/services/base.service';
import {MediaType, PostSort} from 'src/types';
import {PostDocument, Posts} from './posts.schema';

@Injectable()
export class PostsService extends BaseService<PostDocument> {
    constructor(@InjectModel(Posts.name) private postModel: Model<PostDocument>) {
        super(postModel);
    }

    getPopulateFields() {
        return [
            {
                path: 'comments',
                options: {sort: {createdAt: -1}},
                populate: [
                    {
                        path: 'creator',
                        select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications'
                    },
                    {path: 'mentions', select: 'firstName lastName avatar'},
                    {path: 'page', select: '_id name profilePhoto'},

                ],
            },
            {path: 'likes', select: 'firstName lastName avatar fcmToken'},
            {
                path: 'creator',
                select: 'firstName lastName avatar userName isGuildMember sellerId fcmToken enableNotifications'
            },
            {path: 'group', select: 'name privacy members creator'},
            {path: 'fundraising', populate: [{path: 'category'}, {path: 'subCategory'}]},
            {
                path: 'reactions', populate: [
                    {path: 'user', select: 'firstName lastName avatar'},
                    {path: 'page', select: 'name profilePhoto'},

                ]
            },
            {path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications'},
            {path: 'mentions', select: 'firstName lastName avatar'},
            {path: 'page', select: 'name profilePhoto'},

            // populate options for shared post.
            {
                path: 'sharedPost',
                populate: [
                    {path: 'creator', select: 'firstName lastName avatar'},
                    {path: 'group', select: 'name'},
                    {path: 'likes', select: 'firstName lastName avatar fcmToken'},
                    {path: 'fundraising', populate: [{path: 'category'}, {path: 'subCategory'}]},
                    {path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications'},
                ],
            },
        ];
    }

    getHomePostpopulateFields() {
        return [
            {
                path: 'comments',
                options: {sort: {createdAt: -1}},
                populate: [
                    {
                        path: 'creator',
                        select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications'
                    },
                    {path: 'mentions', select: 'firstName lastName avatar'},
                    {path: 'page', select: '_id name profilePhoto'},

                    {
                        // first level reply
                        path: 'replies',
                        options: {sort: {createdAt: -1}},
                        populate: [
                            {
                                path: 'creator',
                                select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications'
                            },
                            {path: 'mentions', select: 'firstName lastName avatar'},
                            {
                                // second level reply
                                path: 'replies',
                                options: {sort: {createdAt: -1}},
                                populate: [
                                    {
                                        path: 'creator',
                                        select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications'
                                    },
                                    {path: 'mentions', select: 'firstName lastName avatar'},
                                    {
                                        // third level reply
                                        path: 'replies',
                                        options: {sort: {createdAt: -1}},
                                        populate: [
                                            {
                                                path: 'creator',
                                                select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications'
                                            },
                                            {path: 'mentions', select: 'firstName lastName avatar'},
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {path: 'likes', select: 'firstName lastName avatar fcmToken'},
            {
                path: 'creator',
                select: 'firstName lastName avatar userName isGuildMember sellerId fcmToken enableNotifications'
            },
            {path: 'group', select: 'name privacy members creator'},
            {path: 'fundraising', populate: [{path: 'category'}, {path: 'subCategory'}]},
            {
                path: 'reactions', populate: [
                    {path: 'user', select: 'firstName lastName avatar'},
                    {path: 'page', select: '_id name profilePhoto'}
                ]
            },
            {path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications'},
            {path: 'page', select: 'name profilePhoto'},
            // populate options for shared post.
            {
                path: 'sharedPost',
                populate: [
                    {path: 'creator', select: 'firstName lastName avatar'},
                    {path: 'group', select: 'name'},
                    {path: 'likes', select: 'firstName lastName avatar fcmToken'},
                    {path: 'fundraising', populate: [{path: 'category'}, {path: 'subCategory'}]},
                    {path: 'tagged', select: 'firstName lastName avatar fcmToken enableNotifications'},
                    {path: 'page', select: 'name profilePhoto'},
                ],
            },
            {path: 'mentions', select: 'firstName lastName avatar'},
        ];
    }


    async find(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
        const posts = await this.postModel.find(query, {}, options).populate(this.getPopulateFields()).lean();
        return posts.map((post) => ({
            ...post,
            totalComments: post.comments.length,
            comments: post.comments.slice(0, 3)
        }));
    }


    async findPostsFilteredByPrivacy(user_id:any,query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
        const posts = await this.postModel.aggregate([
            {$match: query},
            {
                $lookup: {
                    from: "groups",
                    let: {group: '$group'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ['$$group', '$_id']},
                                    ]
                                }
                            },
                        },
                    ],
                    as: 'group_details'
                },
            },
            {
                $match: {
                    $or: [
                        {"group_details.privacy": "public"},
                        {
                            $and: [
                                {"group_details.privacy": "private"},
                                {"group_details.creator":user_id},
                                {"group.members":{$in:[user_id]}}
                            ]
                        }
                    ]
                }
            },
            { $unset: ["group_details"] },
            {
                $skip: (options.perPage) * (options.page-1)
            },
            {
                $limit: options.perPage
            },
            {
                $sort:options.sort
            },
        ])



        const total = (await this.postModel.aggregate([
            {$match: query},
            {
                $lookup: {
                    from: "groups",
                    let: {group: '$group'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ['$$group', '$_id']},
                                    ]
                                }
                            },
                        },
                    ],
                    as: 'group_details'
                },
            },
            {
                $match: {
                    $or: [
                        {"group_details.privacy": "public"},
                        {
                            $and: [
                                {"group_details.privacy": "private"},
                                {"group_details.creator":user_id},
                                {"group.members":{$in:[user_id]}}
                            ]
                        }
                    ]
                }
            },
            { $unset: ["group_details"] },
        ])).length

        await this.postModel.populate(posts,this.getPopulateFields());
        return {posts:posts.map((post) => ({
            ...post,
            totalComments: post.comments.length,
            comments: post.comments.slice(0, 3)
        })),total};
    }

    async findHomePosts(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
        const posts = await this.postModel.find(query, {}, options).populate(this.getHomePostpopulateFields()).lean();
        return posts.map((post) => ({...post, comments: post.comments.slice(0, 3)}));
    }


    async getRandomPosts() {
        const posts = await this.postModel.aggregate([{$match: {"page": {$exists: true}}}, {$sample: {size: 10}}]);
        await this.postModel.populate(posts, this.getHomePostpopulateFields());

        return posts.map((post) => ({...post, comments: post.comments.slice(0, 3)}));
    }


    async update(query: FilterQuery<PostDocument>, updateQuery: UpdateQuery<PostDocument>) {
        return await this.postModel.findOneAndUpdate(query, updateQuery, {new: true}).populate(this.getPopulateFields()).lean();
    }

    async createPost(query: FilterQuery<PostDocument>) {
        return (await this.postModel.create(query)).populate(this.getPopulateFields());
    }

    async findOne(query: FilterQuery<PostDocument>) {
        return await this.postModel.findOne(query).populate(this.getPopulateFields()).lean();
    }

    async FindAllFundraisingProjects(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
        return await this.postModel.find(query, {}, options).select('fundraising status').populate('fundraising').lean();
    }

    getHomePostSort(sort?: string) {
        let sortOrder;
        if (sort === PostSort.MOST_RECENT) sortOrder = {createdAt: -1};
        else if (sort === PostSort.RECENT_INTERACTIONS) sortOrder = {updatedAt: -1};
        return {featured: -1, pin: -1, ...sortOrder};
    }

    async findPostMedia(query: FilterQuery<PostDocument>, type: string) {
        const posts = await this.postModel.find(query).select('images videos');

        // retrive all videos
        if (type === MediaType.VIDEO) {
            let videos = [];
            posts.forEach((post) => {
                if (post.videos.length > 0) videos = [...videos, ...post.videos];
            });
            return videos;
        }

        // retrive all images
        else if (type === MediaType.IMAGE) {
            let images = [];
            posts.forEach((post) => {
                if (post.images.length > 0) images = [...images, ...post.images];
            });
            return images;
        }
    }
}
