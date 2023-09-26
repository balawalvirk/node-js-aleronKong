import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { GroupInvitationStatus } from 'src/types';
import { User } from 'src/users/users.schema';
import {Page} from "src/page/page.schema";

export type PageInvitationDocument = PageInvitation & mongoose.Document;

@Schema({ timestamps: true })
export class PageInvitation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true })
  page: Page;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  friend: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ enum: GroupInvitationStatus, default: GroupInvitationStatus.PENDING })
  status: string;
}

export const PageInvitationSchema = SchemaFactory.createForClass(PageInvitation);
