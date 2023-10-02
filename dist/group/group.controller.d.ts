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
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UserDocument } from 'src/users/users.schema';
import { PostsService } from 'src/posts/posts.service';
import { CreatePostsDto } from 'src/posts/dtos/create-posts';
import { FundService } from 'src/fundraising/fund.service';
import { FundraisingService } from 'src/fundraising/fundraising.service';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { MuteGroupDto } from './dto/mute-group.dto';
import { FindPostsOfGroupQueryDto } from './dto/findGroupPost.query.dto';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { ModeratorService } from './moderator.service';
import { UpdateModeratorDto } from './dto/update-moderator.dto';
import { MuteService } from 'src/mute/mute.service';
import { FindAllQueryDto } from './dto/find-all.query.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { BanMemberDto } from './dto/ban-member.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { GroupInvitationService } from './invitation.service';
import { ReportService } from 'src/report/report.service';
import { PageService } from 'src/page/page.service';
export declare class GroupController {
    private readonly groupService;
    private readonly postService;
    private readonly fundraisingService;
    private readonly fundService;
    private readonly notificationService;
    private readonly firebaseService;
    private readonly moderatorService;
    private readonly muteService;
    private readonly invitationService;
    private readonly reportService;
    private readonly pageService;
    constructor(groupService: GroupService, postService: PostsService, fundraisingService: FundraisingService, fundService: FundService, notificationService: NotificationService, firebaseService: FirebaseService, moderatorService: ModeratorService, muteService: MuteService, invitationService: GroupInvitationService, reportService: ReportService, pageService: PageService);
    create(createGroupDto: CreateGroupDto, user: UserDocument): Promise<import("./group.schema").Group & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createPost(createPostDto: CreatePostsDto, user: UserDocument): Promise<Omit<import("../posts/posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    isGroupModerator(postId: string, userId: string): Promise<false | (import("./moderator.schema").Moderator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })>;
    deletePost(id: string, user: UserDocument): Promise<{
        message: string;
    }>;
    feed(user: UserDocument, page: string, limit: string): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: {
            totalComments: number;
            comments: import("mongoose").LeanDocument<import("../posts/comment.schema").Comment>[];
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
            group: import("./group.schema").Group;
            reactions: import("mongoose").LeanDocument<import("../posts/reaction.schema").Reaction>[];
            mentions: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            likes: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            privacy: string;
            isBlocked: boolean;
            fundraising: import("../fundraising/fundraising.schema").Fundraising;
            pin: boolean;
            featured: boolean;
            tagged: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            sharedPost: import("../posts/posts.schema").Posts;
        }[];
    }>;
    findOne(id: string): Promise<import("./group.schema").Group & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<import("./group.schema").Group & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    joinGroup(user: UserDocument, id: string): Promise<import("./group.schema").Group & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    leaveGroup(user: UserDocument, id: string): Promise<string>;
    remove(id: string, user: UserDocument): Promise<string>;
    findAllMembers(id: string): Promise<import("./member.schema").Member[]>;
    removeMember(removeMemberDto: RemoveMemberDto, user: UserDocument): Promise<import("./member.schema").Member[]>;
    banMember(banMemberDto: BanMemberDto, user: UserDocument): Promise<import("./member.schema").Member[]>;
    unBanMember(unBanMemberDto: BanMemberDto, user: UserDocument): Promise<import("./member.schema").Member[]>;
    findAllRequests(id: string): Promise<import("src/users/users.schema").User[]>;
    approveRejectRequest(isApproved: boolean, id: string, userId: string, user: UserDocument): Promise<"Request approved successfully." | "Request rejected successfully.">;
    findAllGroups({ type, query, limit, page }: FindAllQueryDto, user: UserDocument): Promise<any[]>;
    muteGroup(muteGroupDto: MuteGroupDto, user: UserDocument): Promise<{
        message: string;
    }>;
    unMute(id: string): Promise<import("../mute/mute.schema").Mute & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findPostsOfGroups(id: string, { limit, page }: FindPostsOfGroupQueryDto, user: UserDocument): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: {
            totalComments: number;
            comments: import("mongoose").LeanDocument<import("../posts/comment.schema").Comment>[];
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
            group: import("./group.schema").Group;
            reactions: import("mongoose").LeanDocument<import("../posts/reaction.schema").Reaction>[];
            mentions: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            likes: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            privacy: string;
            isBlocked: boolean;
            fundraising: import("../fundraising/fundraising.schema").Fundraising;
            pin: boolean;
            featured: boolean;
            tagged: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
            sharedPost: import("../posts/posts.schema").Posts;
        }[];
    }>;
    createModerator(createModeratorDto: CreateModeratorDto, user: UserDocument): Promise<Omit<import("./moderator.schema").Moderator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAllModerator(id: string): Promise<Omit<import("./moderator.schema").Moderator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    deleteModerator(id: string, user: UserDocument): Promise<import("./moderator.schema").Moderator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateModerator(id: string, updateModeratorDto: UpdateModeratorDto, user: UserDocument): Promise<import("./moderator.schema").Moderator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createInvitation({ friend, group }: CreateInvitationDto, user: UserDocument): Promise<Omit<import("./invitation.schema").GroupInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAllInvitations(user: UserDocument): Promise<Omit<import("./invitation.schema").GroupInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    acceptRejectInvitations(isApproved: boolean, id: string, user: UserDocument): Promise<import("./invitation.schema").GroupInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
