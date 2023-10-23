import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {User} from 'src/users/users.schema';
import {Posts} from './posts.schema';
import {Reaction} from './reaction.schema';
import {Page} from "src/page/page.schema";

export type CommentDocument = Comment & mongoose.Document;

@Schema({timestamps: true})
export class Comment {
    @Prop()
    content: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    creator: User;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Posts'})
    post: Posts;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reaction'}]})
    reactions: Reaction[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]})
    replies: Comment[];

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Comment'})
    comment: Comment;


    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Page'})
    page: Page;


    @Prop()
    gif: string;

    @Prop()
    root: boolean;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]})
    mentions: User[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
