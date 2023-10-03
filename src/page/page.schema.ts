import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Posts} from 'src/posts/posts.schema';
import {User} from 'src/users/users.schema';
import {Moderator} from "src/group/moderator.schema";
import {Reaction} from "src/posts/reaction.schema";
import {Comment} from "src/posts/comment.schema";

export type PageDocument = Page & mongoose.Document;

@Schema({timestamps: true, versionKey: false, _id: false})
export class Follower {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    follower: User;

    @Prop({dafault: false})
    banned: boolean;
}


@Schema({timestamps: true, versionKey: false, _id: false})
export class Moderators {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    user: User;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'PageModerator', required: true})
    moderator: Moderator;
}



const FollowerSchema = SchemaFactory.createForClass(Follower);
const ModeratorSchema = SchemaFactory.createForClass(Moderators);

@Schema({timestamps: true})
export class Page {
    @Prop({required: true})
    coverPhoto: string;

    @Prop({required: true})
    profilePhoto: string;

    @Prop({required: true})
    description: string;

    @Prop({required: true, unique: true})
    name: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    creator: User;

    @Prop({type: [FollowerSchema]})
    followers: Follower[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Posts'}]})
    posts: Posts[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], required: true})
    requests: User[];


    @Prop({type: [ModeratorSchema]})
    moderators:Moderators[];


    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PageReaction' }] })
    reactions: Reaction[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PageComment' }] })
    comments: Comment[];

}

export const PageSchema = SchemaFactory.createForClass(Page);
