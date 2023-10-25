import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import {Page} from "src/page/page.schema";

@Schema({ timestamps: true, versionKey: false, _id: false })
export class PageMember {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true })
  page: Page;

  @Prop({ dafault: false })
  banned: boolean;
}

export const PageMemberSchema = SchemaFactory.createForClass(PageMember);
