import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type CommentDocument = Comment & mongoose.Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  creator: User[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
