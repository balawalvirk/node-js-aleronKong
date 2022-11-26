import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare class Comment {
    content: string;
    creator: User;
}
export declare const CommentSchema: mongoose.Schema<Comment, mongoose.Model<Comment, any, any, any, any>, {}, {}, {}, {}, "type", Comment>;
