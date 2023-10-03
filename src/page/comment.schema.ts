import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import {Page} from "src/page/page.schema";
import {PageReaction} from "src/page/reaction.schema";

export type PageCommentDocument = PageComment & mongoose.Document;

@Schema({ timestamps: true })
export class PageComment {
  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Page' })
  page: Page;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PageReaction' }] })
  reactions: PageReaction[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PageComment' }] })
  replies: PageComment[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PageComment' })
  comment: PageComment;

  @Prop()
  gif: string;

  @Prop()
  root: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  mentions: User[];
}
export const PageCommentSchema = SchemaFactory.createForClass(PageComment);
