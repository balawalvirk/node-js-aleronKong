import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ReportType } from 'src/types';
import { User } from 'src/users/users.schema';
import { Group } from './group.schema';

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  reporter: User;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  group: Group;

  @Prop({ enum: ReportType })
  type: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
