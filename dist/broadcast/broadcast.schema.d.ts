import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare type BroadcastDocument = Broadcast & mongoose.Document;
declare class Recording {
    sid: string;
    resourceId: string;
    uid: string;
}
export declare class Broadcast {
    channel: string;
    token: string;
    user: User;
    recording: Recording;
}
export declare const BroadcastSchema: mongoose.Schema<Broadcast, mongoose.Model<Broadcast, any, any, any, any>, {}, {}, {}, {}, "type", Broadcast>;
export {};
