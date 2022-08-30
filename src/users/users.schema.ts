import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  userName: string;

  @Prop()
  birthDate: Date;

  @Prop()
  avatar: string;

  @Prop({ default: 'local', enum: ['local', 'twitter', 'google', 'facebook'] })
  authType: string;

  @Prop({ default: 'author', enum: ['author', 'fan'] })
  role: string;

  @Prop({ default: 'active', enum: ['blocked', 'active'] })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
