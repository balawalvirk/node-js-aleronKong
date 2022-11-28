import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { FundraisingCategory } from 'src/fundraising/category.schema';
import { FundraisingSubcategory } from 'src/fundraising/subCategory.schema';
import { Group } from 'src/group/group.schema';
import { Report, ReportSchema } from 'src/group/report.schema';
import { PostPrivacy, PostStatus, PostType } from 'src/types';
import { User } from 'src/users/users.schema';
import { CommentSchema, Comment } from './comment.schema';

export type PostDocument = Posts & mongoose.Document;
@Schema({ timestamps: true })
export class Posts {
  @Prop()
  content: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: User[];

  @Prop({ type: [CommentSchema] })
  comments: Comment[];

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: [String] })
  videos: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ enum: PostPrivacy, required: true })
  privacy: string;

  @Prop()
  isBlocked: boolean;

  @Prop({ enum: PostStatus, default: PostStatus.ACTIVE })
  status: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  blockers: User[];

  @Prop({ type: [ReportSchema] })
  reports: Report[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  group: Group;

  @Prop({ enum: PostType, default: PostType.POST })
  type: string;

  // fundraising  schema
  @Prop()
  projectTitle: string;

  @Prop()
  projectSubtitle: string;

  @Prop()
  projectDescription: string;

  @Prop()
  projectVideo: string;

  @Prop()
  projectImage: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FundraisingCategory' })
  projectCategory: FundraisingCategory;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FundraisingSubcategory' })
  projectSubCategory: FundraisingSubcategory;

  @Prop()
  projectLocation: string;

  @Prop()
  projectLaunchDate: Date;

  @Prop()
  projectCompaignDuration: number;

  @Prop()
  projectFundingGoal: number;

  @Prop()
  projectBank: string;

  @Prop()
  projectBankAccount: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  supporters: User[];
}

export const PostSchema = SchemaFactory.createForClass(Posts);
