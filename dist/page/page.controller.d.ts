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
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PaginationDto } from 'src/helpers';
import { User, UserDocument } from 'src/users/users.schema';
import { PostsService } from 'src/posts/posts.service';
import { FindAllPagesQueryDto } from './dto/find-all-pages.query.dto';
import { PageInvitationService } from "src/page/invitation.service";
import { NotificationService } from "src/notification/notification.service";
import { FirebaseService } from "src/firebase/firebase.service";
import { CreateInvitationDto } from "src/page/dto/create-invitation.dto";
import { PageModeratorService } from "src/page/moderator.service";
import { CreatePageModeratorDto } from "src/page/dto/create-page-moderator.dto";
import { UpdatePageModeratorDto } from "src/page/dto/update-page-moderator.dto";
export declare class PageController {
    private readonly pageService;
    private readonly postService;
    private readonly invitationService;
    private readonly notificationService;
    private readonly firebaseService;
    private readonly moderatorService;
    constructor(pageService: PageService, postService: PostsService, invitationService: PageInvitationService, notificationService: NotificationService, firebaseService: FirebaseService, moderatorService: PageModeratorService);
    create(createPageDto: CreatePageDto, user: UserDocument): Promise<import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findOne(id: string): Promise<import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    update(id: string, updatePageDto: UpdatePageDto): Promise<import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAll({ filter, query, limit, page, created, moderating, following }: FindAllPagesQueryDto, user: UserDocument): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: (import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    findUserPages(id: string, { page, limit }: PaginationDto): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: (import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    follow(id: string, user: UserDocument): Promise<import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    unFollow(user: UserDocument, id: string): Promise<import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAllfollowedPages(user: UserDocument): Promise<Omit<import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    feed(user: UserDocument, { page, limit }: PaginationDto): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: {
            totalComments: number;
            comments: import("mongoose").LeanDocument<import("../posts/comment.schema").Comment>[];
            _id: any;
            page: import("./page.schema").Page;
            type: string;
            __v?: any;
            id?: any;
            creator: User;
            status: string;
            content: string;
            gif: string;
            videos: string[];
            images: string[];
            group: import("../group/group.schema").Group;
            reactions: import("mongoose").LeanDocument<import("../posts/reaction.schema").Reaction>[];
            mentions: import("mongoose").LeanDocument<User>[];
            likes: import("mongoose").LeanDocument<User>[];
            privacy: string;
            isBlocked: boolean;
            fundraising: import("../fundraising/fundraising.schema").Fundraising;
            pin: boolean;
            featured: boolean;
            tagged: import("mongoose").LeanDocument<User>[];
            sharedPost: import("../posts/posts.schema").Posts;
        }[];
    }>;
    findAllFollowers(id: string): Promise<import("./page.schema").Follower[]>;
    findPostsOfPage(id: string, { limit, page }: PaginationDto, user: UserDocument): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: {
            totalComments: number;
            comments: import("mongoose").LeanDocument<import("../posts/comment.schema").Comment>[];
            _id: any;
            page: import("./page.schema").Page;
            type: string;
            __v?: any;
            id?: any;
            creator: User;
            status: string;
            content: string;
            gif: string;
            videos: string[];
            images: string[];
            group: import("../group/group.schema").Group;
            reactions: import("mongoose").LeanDocument<import("../posts/reaction.schema").Reaction>[];
            mentions: import("mongoose").LeanDocument<User>[];
            likes: import("mongoose").LeanDocument<User>[];
            privacy: string;
            isBlocked: boolean;
            fundraising: import("../fundraising/fundraising.schema").Fundraising;
            pin: boolean;
            featured: boolean;
            tagged: import("mongoose").LeanDocument<User>[];
            sharedPost: import("../posts/posts.schema").Posts;
        }[];
    }>;
    remove(id: string, user: UserDocument): Promise<import("./page.schema").Page & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createModerator(createModeratorDto: CreatePageModeratorDto, user: UserDocument): Promise<Omit<import("./moderator.schema").PageModerator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAllModerator(id: string): Promise<Omit<import("./moderator.schema").PageModerator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    deleteModerator(id: string, user: UserDocument): Promise<import("./moderator.schema").PageModerator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateModerator(id: string, updateModeratorDto: UpdatePageModeratorDto, user: UserDocument): Promise<import("./moderator.schema").PageModerator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createInvitation({ friend, page }: CreateInvitationDto, user: UserDocument): Promise<Omit<import("./invitation.schema").PageInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAllInvitations(user: UserDocument): Promise<Omit<import("./invitation.schema").PageInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    acceptRejectInvitations(isApproved: boolean, id: string, user: UserDocument): Promise<import("./invitation.schema").PageInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    approveRejectRequest(isApproved: boolean, id: string, userId: string, user: UserDocument): Promise<"Request approved successfully." | "Request rejected successfully.">;
}
