import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare class Report {
    reporter: User;
    reason: string;
}
export declare const ReportSchema: mongoose.Schema<Report, mongoose.Model<Report, any, any, any, any>, {}, {}, {}, {}, "type", Report>;
