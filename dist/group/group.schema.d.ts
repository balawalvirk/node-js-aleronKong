import * as mongoose from 'mongoose';
import { Mute } from 'src/mute/mute.schema';
import { Posts } from 'src/posts/posts.schema';
import { User } from 'src/users/users.schema';
import { Member } from './member.schema';
import { Moderator } from './moderator.schema';
import { Report } from './report.schema';
export declare type GroupDocument = Group & mongoose.Document;
export declare class Group {
    coverPhoto: string;
    profilePhoto: string;
    description: string;
    name: string;
    creator: User;
    privacy: string;
    members: Member[];
    posts: Posts[];
    requests: User[];
    reports: Report[];
    moderators: Moderator[];
    rules: string;
    mutes: Mute[];
}
export declare const GroupSchema: mongoose.Schema<Group, mongoose.Model<Group, any, any, any, any>, {}, {}, {}, {}, "type", Group>;
