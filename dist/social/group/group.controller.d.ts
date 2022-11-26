import { GroupService } from './group.service';
import { PostsService } from 'src/social/posts/posts.service';
export declare class GroupController {
    private readonly groupService;
    private readonly postService;
    constructor(groupService: GroupService, postService: PostsService);
}
