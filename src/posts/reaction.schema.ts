import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {User} from 'src/users/users.schema';
import {Comment} from './comment.schema';
import {Posts} from './posts.schema';
import {Page} from "src/page/page.schema";

export type ReactionDocument = Reaction & mongoose.Document;

@Schema({timestamps: true})
export class Reaction {
    @Prop({required: true})
    emoji: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    user: User;


    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Page'})
    page: Page;


    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Post'})
    post: Posts;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Comment'})
    comment: Comment;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
