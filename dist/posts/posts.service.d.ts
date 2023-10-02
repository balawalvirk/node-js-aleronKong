/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { PostDocument, Posts } from './posts.schema';
export declare class PostsService extends BaseService<PostDocument> {
    private postModel;
    constructor(postModel: Model<PostDocument>);
    getPopulateFields(): ({
        path: string;
        options: {
            sort: {
                createdAt: number;
            };
        };
        populate: {
            path: string;
            select: string;
        }[];
        select?: undefined;
    } | {
        path: string;
        select: string;
        options?: undefined;
        populate?: undefined;
    } | {
        path: string;
        populate: {
            path: string;
        }[];
        options?: undefined;
        select?: undefined;
    } | {
        path: string;
        populate: {
            path: string;
            select: string;
        };
        options?: undefined;
        select?: undefined;
    } | {
        path: string;
        populate: ({
            path: string;
            select: string;
            populate?: undefined;
        } | {
            path: string;
            populate: {
                path: string;
            }[];
            select?: undefined;
        })[];
        options?: undefined;
        select?: undefined;
    })[];
    getHomePostpopulateFields(): ({
        path: string;
        options: {
            sort: {
                createdAt: number;
            };
        };
        populate: ({
            path: string;
            select: string;
            options?: undefined;
            populate?: undefined;
        } | {
            path: string;
            options: {
                sort: {
                    createdAt: number;
                };
            };
            populate: ({
                path: string;
                select: string;
                options?: undefined;
                populate?: undefined;
            } | {
                path: string;
                options: {
                    sort: {
                        createdAt: number;
                    };
                };
                populate: ({
                    path: string;
                    select: string;
                    options?: undefined;
                    populate?: undefined;
                } | {
                    path: string;
                    options: {
                        sort: {
                            createdAt: number;
                        };
                    };
                    populate: {
                        path: string;
                        select: string;
                    }[];
                    select?: undefined;
                })[];
                select?: undefined;
            })[];
            select?: undefined;
        })[];
        select?: undefined;
    } | {
        path: string;
        select: string;
        options?: undefined;
        populate?: undefined;
    } | {
        path: string;
        populate: {
            path: string;
        }[];
        options?: undefined;
        select?: undefined;
    } | {
        path: string;
        populate: {
            path: string;
            select: string;
        };
        options?: undefined;
        select?: undefined;
    } | {
        path: string;
        populate: ({
            path: string;
            select: string;
            populate?: undefined;
        } | {
            path: string;
            populate: {
                path: string;
            }[];
            select?: undefined;
        })[];
        options?: undefined;
        select?: undefined;
    })[];
    find(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>): Promise<{
        totalComments: number;
        comments: import("mongoose").LeanDocument<import("./comment.schema").Comment>[];
        _id: any;
        page: import("../page/page.schema").Page;
        type: string;
        __v?: any;
        id?: any;
        creator: import("../users/users.schema").User;
        status: string;
        content: string;
        gif: string;
        videos: string[];
        images: string[];
        group: import("../group/group.schema").Group;
        reactions: import("mongoose").LeanDocument<import("./reaction.schema").Reaction>[];
        mentions: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        likes: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        privacy: string;
        isBlocked: boolean;
        fundraising: import("../fundraising/fundraising.schema").Fundraising;
        pin: boolean;
        featured: boolean;
        tagged: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        sharedPost: Posts;
    }[]>;
    findHomePosts(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>): Promise<{
        comments: import("mongoose").LeanDocument<import("./comment.schema").Comment>[];
        _id: any;
        page: import("../page/page.schema").Page;
        type: string;
        __v?: any;
        id?: any;
        creator: import("../users/users.schema").User;
        status: string;
        content: string;
        gif: string;
        videos: string[];
        images: string[];
        group: import("../group/group.schema").Group;
        reactions: import("mongoose").LeanDocument<import("./reaction.schema").Reaction>[];
        mentions: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        likes: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        privacy: string;
        isBlocked: boolean;
        fundraising: import("../fundraising/fundraising.schema").Fundraising;
        pin: boolean;
        featured: boolean;
        tagged: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        sharedPost: Posts;
    }[]>;
    update(query: FilterQuery<PostDocument>, updateQuery: UpdateQuery<PostDocument>): Promise<import("mongoose").LeanDocument<Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    createPost(query: FilterQuery<PostDocument>): Promise<Omit<Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findOne(query: FilterQuery<PostDocument>): Promise<import("mongoose").LeanDocument<Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    FindAllFundraisingProjects(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>): Promise<import("mongoose").LeanDocument<Omit<Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>[]>;
    getHomePostSort(sort?: string): any;
    findPostMedia(query: FilterQuery<PostDocument>, type: string): Promise<any[]>;
}
