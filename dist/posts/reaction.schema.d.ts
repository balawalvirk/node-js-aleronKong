import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Comment } from './comment.schema';
import { Posts } from './posts.schema';
export declare type ReactionDocument = Reaction & mongoose.Document;
export declare class Reaction {
    emoji: string;
    user: User;
    post: Posts;
    comment: Comment;
}
export declare const ReactionSchema: mongoose.Schema<Reaction, mongoose.Model<Reaction, any, any, any, any>, {}, {}, {}, {}, "type", Reaction>;
