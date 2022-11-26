import * as mongoose from 'mongoose';
import { Group } from 'src/group/group.schema';
import { User } from 'src/users/users.schema';
import { Comment } from './comment.schema';
export declare type PostDocument = Posts & mongoose.Document;
export declare class Posts {
    content: string;
    likes: User[];
    comments: Comment[];
    media: string[];
    creator: User;
    privacy: string;
    blockers: User[];
    reporter: User;
    group: Group;
    type: string;
}
export declare const PostSchema: mongoose.Schema<Posts, mongoose.Model<Posts, any, any, any, any>, {}, {}, {}, {}, "type", Posts>;
