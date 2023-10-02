import * as mongoose from 'mongoose';
import { Group } from 'src/group/group.schema';
import { User } from 'src/users/users.schema';
export declare type ReportDocument = Report & mongoose.Document;
export declare class Report {
    type: string;
    user: User;
    reporter: User;
    group: Group;
    reason: string;
}
export declare const ReportSchema: mongoose.Schema<Report, mongoose.Model<Report, any, any, any, any>, {}, {}, {}, {}, "type", Report>;
