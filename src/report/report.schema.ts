import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Group } from 'src/group/group.schema';
import { ReportType } from 'src/types';
import { User } from 'src/users/users.schema';

export type ReportDocument = Report & mongoose.Document;
@Schema({ timestamps: true })
export class Report {
  @Prop({ enum: ReportType })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reportedUser: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  reporter: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  reportedGroup: Group;

  @Prop({ required: true })
  reason: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
