import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Posts } from './posts.schema';
import { Reaction } from './reaction.schema';
export declare type CommentDocument = Comment & mongoose.Document;
export declare class Comment {
    content: string;
    creator: User;
    post: Posts;
    reactions: Reaction[];
    replies: Comment[];
    comment: Comment;
    gif: string;
    root: boolean;
    mentions: User[];
}
export declare const CommentSchema: mongoose.Schema<Comment, mongoose.Model<Comment, any, any, any, any>, {}, {}, {}, {}, "type", Comment>;
