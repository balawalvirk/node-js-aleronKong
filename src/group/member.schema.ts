import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

@Schema({ timestamps: true })
export class Member {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  member: User;
}

export const memberSchema = SchemaFactory.createForClass(Member);
