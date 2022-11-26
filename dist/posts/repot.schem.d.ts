import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare class Repot {
    reason: string;
    reportedBy: User;
}
export declare const ReportSchema: mongoose.Schema<Comment, mongoose.Model<Comment, any, any, any, any>, {}, {}, {}, {}, "type", Comment>;
