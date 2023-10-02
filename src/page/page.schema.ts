import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Posts} from 'src/posts/posts.schema';
import {User} from 'src/users/users.schema';
import {Moderator} from "src/group/moderator.schema";

export type PageDocument = Page & mongoose.Document;

@Schema({timestamps: true, versionKey: false, _id: false})
export class Follower {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    follower: User;

    @Prop({dafault: false})
    banned: boolean;
}

const FollowerSchema = SchemaFactory.createForClass(Follower);

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


    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], required: true})
    moderators: Moderator[];


}

export const PageSchema = SchemaFactory.createForClass(Page);
