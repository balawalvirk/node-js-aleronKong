import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Group } from './group.schema';
export declare class Report {
    reporter: User;
    reason: string;
    user: User;
    group: Group;
    type: string;
}
export declare const ReportSchema: mongoose.Schema<Report, mongoose.Model<Report, any, any, any, any>, {}, {}, {}, {}, "type", Report>;
