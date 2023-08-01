import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Member, MemberSchema } from 'src/group/member.schema';
import { Posts } from 'src/posts/posts.schema';
import { User } from 'src/users/users.schema';

export type PageDocument = Page & mongoose.Document;
@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true })
  coverPhoto: string;

  @Prop({ required: true })
  profilePhoto: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: [MemberSchema] })
  members: Member[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }] })
  posts: Posts[];
}

export const PageSchema = SchemaFactory.createForClass(Page);
