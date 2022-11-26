import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreateGroupDto } from './group/dto/create-group.dto';
import { UpdateGroupDto } from './group/dto/update-group.dto';
import { GroupDocument } from './group/group.schema';
import { GroupService } from './group/group.service';
import { CreateCommentDto } from './posts/dtos/create-comment';
import { CreatePostsDto } from './posts/dtos/create-posts';
import { PostsService } from './posts/posts.service';
export declare class SocialController {
    private readonly postsService;
    private readonly usersService;
    private readonly groupService;
    constructor(postsService: PostsService, usersService: UsersService, groupService: GroupService);
    createPost(createPostsDto: CreatePostsDto, user: UserDocument): Promise<void>;
    findAllPosts(user: UserDocument, privacy: string): Promise<import("./posts/posts.schema").Posts[]>;
    findMinePosts(user: UserDocument): Promise<import("./posts/posts.schema").Posts[]>;
    addLike(postId: string, user: UserDocument): Promise<import("./posts/posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createComment(postId: string, user: UserDocument, body: CreateCommentDto): Promise<import("./posts/posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    blockPost(postId: string, user: UserDocument): Promise<any>;
    reportPost(postId: string, user: UserDocument): Promise<any>;
    createGroup(createGroupDto: CreateGroupDto, user: UserDocument): Promise<any>;
    findOneGroup(id: string): Promise<import("./group/group.schema").Group & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<any>;
    joinGroup(user: UserDocument, id: string): Promise<any>;
    leaveGroup(user: UserDocument, id: string): Promise<string>;
    remove(id: string): Promise<string>;
    findAllMembers(id: string): Promise<import("./group/member.schema").Member[]>;
    findAllRequests(id: string): Promise<import("src/users/users.schema").User[]>;
    approveRejectRequest(isApproved: boolean, id: string, userId: string): Promise<"Request approved successfully." | "Request rejected successfully.">;
    findAllGroups(type: string, query: string, user: UserDocument): Promise<GroupDocument[]>;
    report(id: string, user: UserDocument, reason: string): Promise<string>;
}
