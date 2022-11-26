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
import { GroupDocument } from './group.schema';
import { PostDocument } from 'src/posts/posts.schema';
export declare class GroupController {
    private readonly groupService;
    private readonly postService;
    constructor(groupService: GroupService, postService: PostsService);
    create(createGroupDto: CreateGroupDto, user: UserDocument): Promise<any>;
    createPost(createPostDto: CreatePostsDto, user: UserDocument): Promise<PostDocument>;
    findOne(id: string): Promise<import("./group.schema").Group & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<any>;
    joinGroup(user: UserDocument, id: string): Promise<any>;
    leaveGroup(user: UserDocument, id: string): Promise<string>;
    remove(id: string): Promise<string>;
    findAllMembers(id: string): Promise<import("./member.schema").Member[]>;
    findAllRequests(id: string): Promise<import("src/users/users.schema").User[]>;
    approveRejectRequest(isApproved: boolean, id: string, userId: string): Promise<"Request approved successfully." | "Request rejected successfully.">;
    findAllGroups(type: string, query: string, user: UserDocument): Promise<GroupDocument[]>;
    report(id: string, user: UserDocument, reason: string): Promise<string>;
}
