import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Mute} from 'src/mute/mute.schema';
import {Posts} from 'src/posts/posts.schema';
import {GroupPrivacy} from 'src/types';
import {User} from 'src/users/users.schema';
import {Member, MemberSchema} from './member.schema';
import {Moderator} from './moderator.schema';
import {Report, ReportSchema} from './report.schema';
import {Page} from "src/page/page.schema";
import {PageMember, PageMemberSchema} from "src/group/member_page.schema";
import {Requests, RequestsSchema} from "src/group/requests.schema";

export type GroupDocument = Group & mongoose.Document;

@Schema({timestamps: true})
export class Group {
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

    @Prop({enum: GroupPrivacy, required: true})
    privacy: string;

    @Prop({type: [MemberSchema]})
    members: Member[];



    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Posts'}]})
    posts: Posts[];

    @Prop({type: [RequestsSchema]})
    requests: Requests[];



    @Prop({type: [ReportSchema]})
    reports: Report[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Moderator'}], required: true})
    moderators: Moderator[];

    @Prop()
    rules: string;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Mute'}], required: true})
    mutes: Mute[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
