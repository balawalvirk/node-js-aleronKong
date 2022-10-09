import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type GroupDocument = Group & mongoose.Document;
@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  coverPhoto: string;

  @Prop({ required: true })
  profilePhoto: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ enum: ['private', 'public'], required: true })
  privacy: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
