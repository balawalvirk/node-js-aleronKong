import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type ReactionDocument = Reaction & mongoose.Document;

@Schema({ timestamps: true })
export class Reaction {
  @Prop({ required: true })
  reaction: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
