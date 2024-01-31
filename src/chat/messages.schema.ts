import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {User} from 'src/users/users.schema';
import {Chat} from './chat.schema';
import {Posts} from "src/posts/posts.schema";

export type MessageDocument = Message & mongoose.Document;

@Schema({timestamps: true})
export class Message {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true})
    chat: Chat;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    sender: User;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    receiver: User;

    @Prop()
    content: string;

    @Prop()
    gif: string;

    @Prop({type: [String]})
    videos: string[];

    @Prop({type: [String]})
    images: string[];

    @Prop({default: false})
    isRead: boolean;

    @Prop([{type: mongoose.Schema.Types.ObjectId, ref: 'User'}])
    deletedBy: [User];

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Posts'})
    post;

}

export const MessageSchema = SchemaFactory.createForClass(Message);
