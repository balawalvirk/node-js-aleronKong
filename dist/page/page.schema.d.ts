import * as mongoose from 'mongoose';
import { Posts } from 'src/posts/posts.schema';
import { User } from 'src/users/users.schema';
import { Moderator } from "src/group/moderator.schema";
export declare type PageDocument = Page & mongoose.Document;
export declare class Follower {
    follower: User;
    banned: boolean;
}
export declare class Page {
    coverPhoto: string;
    profilePhoto: string;
    description: string;
    name: string;
    creator: User;
    followers: Follower[];
    posts: Posts[];
    requests: User[];
    moderators: Moderator[];
}
export declare const PageSchema: mongoose.Schema<Page, mongoose.Model<Page, any, any, any, any>, {}, {}, {}, {}, "type", Page>;
