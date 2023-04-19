import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type BroadcastDocument = Broadcast & mongoose.Document;

@Schema({ timestamps: true })
export class Broadcast {
  @Prop({ required: true })
  channel: string;

  @Prop({ required: true })
  token: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const BroadcastSchema = SchemaFactory.createForClass(Broadcast);
