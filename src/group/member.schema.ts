import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

@Schema({ timestamps: true, versionKey: false, _id: false })
export class Member {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  member: User;

  @Prop({ dafault: false })
  banned: boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
