import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Mute} from 'src/mute/mute.schema';
import {User} from 'src/users/users.schema';
import {Message} from './messages.schema';
import {Posts} from "src/posts/posts.schema";

export type ChatDocument = Chat & mongoose.Document;

@Schema({timestamps: true})
export class Chat {
    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]})
    members: User[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Mute'}]})
    mutes: Mute[];

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Message'})
    lastMessage: Message;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}]})
    messages: Message[];


}

export const ChatSchema = SchemaFactory.createForClass(Chat);
