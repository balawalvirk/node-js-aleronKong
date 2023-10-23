import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {User} from 'src/users/users.schema';
import {Page} from "src/page/page.schema";

@Schema({timestamps: true, versionKey: false, _id: false})
export class Member {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Page'})
    page: Page;

    @Prop({dafault: false})
    banned: boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
