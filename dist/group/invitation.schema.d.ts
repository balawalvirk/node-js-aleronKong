import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Group } from './group.schema';
export declare type GroupInvitationDocument = GroupInvitation & mongoose.Document;
export declare class GroupInvitation {
    group: Group;
    friend: User;
    user: User;
    status: string;
}
export declare const GroupInvitationSchema: mongoose.Schema<GroupInvitation, mongoose.Model<GroupInvitation, any, any, any, any>, {}, {}, {}, {}, "type", GroupInvitation>;
