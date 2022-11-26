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
