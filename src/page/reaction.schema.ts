import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import {Page} from "src/page/page.schema";
import {PageComment} from "src/page/comment.schema";

export type PageReactionDocument = PageReaction & mongoose.Document;

@Schema({ timestamps: true })
export class PageReaction {
  @Prop({ required: true })
  emoji: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Page' })
  page: Page;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PageComment' })
  comment: PageComment;
}

export const PageReactionSchema = SchemaFactory.createForClass(PageReaction);
