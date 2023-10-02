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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { FirebaseService } from 'src/firebase/firebase.service';
import { GroupService } from 'src/group/group.service';
import { ModeratorService } from 'src/group/moderator.service';
import { NotificationService } from 'src/notification/notification.service';
import { ReportService } from 'src/report/report.service';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CommentService } from './comment.service';
import { AddReactionsDto } from './dtos/add-reactions.dto';
import { CreateCommentDto } from './dtos/create-comment';
import { FeatureUnFeatureDto } from './dtos/feature-unfeature.dto';
import { FindAllCommentQueryDto } from './dtos/find-all-comments.query.dto';
import { FindAllPostQuery } from './dtos/find-all-post.query.dto';
import { FindEngagedPostQuery } from './dtos/find-engaged-posts.query.dto';
import { FindHomePostQueryDto } from './dtos/find-home-post.query.dto';
import { PinUnpinDto } from './dtos/pin-unpin-post.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { UpdateReactionsDto } from './dtos/update-reaction.dto';
import { PostsService } from './posts.service';
import { ReactionService } from './reaction.service';
export declare class PostsController {
    private readonly postsService;
    private readonly userService;
    private readonly commentService;
    private readonly firebaseService;
    private readonly notificationService;
    private readonly reactionService;
    private readonly groupService;
    private readonly moderatorService;
    private readonly reportService;
    constructor(postsService: PostsService, userService: UsersService, commentService: CommentService, firebaseService: FirebaseService, notificationService: NotificationService, reactionService: ReactionService, groupService: GroupService, moderatorService: ModeratorService, reportService: ReportService);
    findAll({ page, limit, query }: FindAllPostQuery): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: Omit<import("./posts.schema").Posts & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>[];
    }>;
    findOne(id: string): Promise<import("mongoose").LeanDocument<import("./posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findUserPost(id: string, page: string, limit: string): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: {
            totalComments: number;
            comments: import("mongoose").LeanDocument<import("./comment.schema").Comment>[];
            _id: any;
            page: import("../page/page.schema").Page;
            type: string;
            __v?: any;
            id?: any;
            creator: import("src/users/users.schema").User;
            status: string;
            content: string;
            gif: string;
            videos: string[];
            images: string[];
            group: import("../group/group.schema").Group;
            reactions: import("mongoose").LeanDocument<import("./reaction.schema").Reaction>[];
            mentions: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            likes: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            privacy: string;
            isBlocked: boolean;
            fundraising: import("../fundraising/fundraising.schema").Fundraising;
            pin: boolean;
            featured: boolean;
            tagged: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            sharedPost: import("./posts.schema").Posts;
        }[];
    }>;
    findHomePosts(user: UserDocument, { limit, page, sort }: FindHomePostQueryDto): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: {
            totalComments: number;
            comments: import("mongoose").LeanDocument<import("./comment.schema").Comment>[];
            _id: any;
            page: import("../page/page.schema").Page;
            type: string;
            __v?: any;
            id?: any;
            creator: import("src/users/users.schema").User;
            status: string;
            content: string;
            gif: string;
            videos: string[];
            images: string[];
            group: import("../group/group.schema").Group;
            reactions: import("mongoose").LeanDocument<import("./reaction.schema").Reaction>[];
            mentions: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            likes: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            privacy: string;
            isBlocked: boolean;
            fundraising: import("../fundraising/fundraising.schema").Fundraising;
            pin: boolean;
            featured: boolean;
            tagged: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            sharedPost: import("./posts.schema").Posts;
        }[];
    }>;
    addLike(id: string, user: UserDocument): Promise<import("mongoose").LeanDocument<import("./posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    unLike(id: string, user: UserDocument): Promise<import("mongoose").LeanDocument<import("./posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    createComment(id: string, user: UserDocument, createCommentDto: CreateCommentDto): Promise<any>;
    findAllComments(id: string, { page, limit }: FindAllCommentQueryDto): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: Omit<import("./comment.schema").Comment & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>[];
    }>;
    updateComment({ commentId, postId, ...rest }: UpdateCommentDto): Promise<import("./comment.schema").Comment & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    isGroupModerator(postId: string, userId: string): Promise<false | (import("../group/moderator.schema").Moderator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })>;
    deleteComment(id: string, postId: string, user: UserDocument): Promise<{
        message: string;
    }>;
    update(updatePostDto: UpdatePostDto, id: string): Promise<import("mongoose").LeanDocument<import("./posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    block(id: string, block: boolean): Promise<{
        message: string;
    }>;
    pinUnpinPost(id: string, pinUnpinDto: PinUnpinDto, user: UserDocument): Promise<{
        message: string;
    }>;
    featureUnFeature(id: string, featureUnFeatureDto: FeatureUnFeatureDto): Promise<import("./posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    addReactions(addReactionsDto: AddReactionsDto, user: UserDocument): Promise<Omit<import("./reaction.schema").Reaction & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    deleteReaction(id: string): Promise<import("./reaction.schema").Reaction & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateReaction(id: string, updateReactionsDto: UpdateReactionsDto): Promise<import("./reaction.schema").Reaction & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findTaggedPosts(user: UserDocument): Promise<{
        totalComments: number;
        comments: import("mongoose").LeanDocument<import("./comment.schema").Comment>[];
        _id: any;
        page: import("../page/page.schema").Page;
        type: string;
        __v?: any;
        id?: any;
        creator: import("src/users/users.schema").User;
        status: string;
        content: string;
        gif: string;
        videos: string[];
        images: string[];
        group: import("../group/group.schema").Group;
        reactions: import("mongoose").LeanDocument<import("./reaction.schema").Reaction>[];
        mentions: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
        likes: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
        privacy: string;
        isBlocked: boolean;
        fundraising: import("../fundraising/fundraising.schema").Fundraising;
        pin: boolean;
        featured: boolean;
        tagged: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
        sharedPost: import("./posts.schema").Posts;
    }[]>;
    findPostAssets(user: UserDocument, type: string): Promise<any[]>;
    findEngagedPosts({ limit, page, filter }: FindEngagedPostQuery, user: UserDocument): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: any[];
    }>;
}
