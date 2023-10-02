import * as mongoose from 'mongoose';
import { Chat } from 'src/chat/chat.schema';
import { Group } from 'src/group/group.schema';
import { User } from 'src/users/users.schema';
export declare type MuteDocument = Mute & mongoose.Document;
export declare class Mute {
    group: Group;
    chat: Chat;
    user: User;
    date: Date;
    startTime: Date;
    endTime: Date;
    interval: string;
}
export declare const MuteSchema: mongoose.Schema<Mute, mongoose.Model<Mute, any, any, any, any>, {}, {}, {}, {}, "type", Mute>;
