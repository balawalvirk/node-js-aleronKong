import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreateCommentDto } from './dtos/create-comment';
import { CreatePostsDto } from './dtos/create-posts';
import { Posts } from './posts.schema';
import { PostsService } from './posts.service';
export declare class PostsController {
    private postsService;
    private usersService;
    constructor(postsService: PostsService, usersService: UsersService);
    createPost(createPostDto: CreatePostsDto, user: UserDocument, id: string): Promise<any>;
    create(createPostsDto: CreatePostsDto, user: UserDocument): Promise<void>;
    findAll(user: UserDocument, privacy: string): Promise<Posts[]>;
    findMine(user: UserDocument): Promise<Posts[]>;
    addLike(postId: string, user: UserDocument): Promise<Posts>;
    createComment(postId: string, user: UserDocument, body: CreateCommentDto): Promise<Posts>;
    blockPost(postId: string, user: UserDocument): Promise<any>;
    reportPost(postId: string, user: UserDocument): Promise<any>;
}
