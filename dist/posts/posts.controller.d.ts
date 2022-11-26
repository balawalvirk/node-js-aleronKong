import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreateCommentDto } from './dtos/create-comment';
import { CreateFundraiserDto } from './dtos/create-fundraiser.dto';
import { Posts } from './posts.schema';
import { PostsService } from './posts.service';
export declare class PostsController {
    private postsService;
    private usersService;
    constructor(postsService: PostsService, usersService: UsersService);
    findAll(user: UserDocument, privacy: string): Promise<Posts[]>;
    findMine(user: UserDocument): Promise<Posts[]>;
    addLike(postId: string, user: UserDocument): Promise<Posts>;
    createComment(postId: string, user: UserDocument, body: CreateCommentDto): Promise<Posts>;
    blockPost(postId: string, user: UserDocument): Promise<any>;
    reportPost(id: string, user: UserDocument, reason: string): Promise<{
        message: string;
    }>;
    createFundraiser(createFundraiserDto: CreateFundraiserDto): Promise<void>;
}
