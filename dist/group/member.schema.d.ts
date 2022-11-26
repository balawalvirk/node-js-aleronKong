import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare class Member {
    member: User;
}
export declare const MemberSchema: mongoose.Schema<Member, mongoose.Model<Member, any, any, any, any>, {}, {}, {}, {}, "type", Member>;
