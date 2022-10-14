import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  reporter: User;
  @Prop({ required: true })
  reason: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
