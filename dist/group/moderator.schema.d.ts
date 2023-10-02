import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Group } from './group.schema';
export declare type ModeratorDocument = Moderator & mongoose.Document;
export declare class Moderator {
    nickName: string;
    user: User;
    acceptMemberRequests: boolean;
    removeMembers: boolean;
    banMembers: boolean;
    deletePosts: boolean;
    pinPosts: boolean;
    deleteComments: boolean;
    group: Group;
}
export declare const ModeratorSchema: mongoose.Schema<Moderator, mongoose.Model<Moderator, any, any, any, any>, {}, {}, {}, {}, "type", Moderator>;
