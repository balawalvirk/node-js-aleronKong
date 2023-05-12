import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Comment, CommentDocument } from './comment.schema';

@Injectable()
export class CommentService extends BaseService<CommentDocument> {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {
    super(commentModel);
  }

  async create(query: FilterQuery<CommentDocument>) {
    return await (
      await this.commentModel.create(query)
    ).populate({ path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' });
  }

  async find(query: FilterQuery<CommentDocument>) {
    return await this.commentModel
      .find(query)
      .populate([
        { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
        { path: 'replies', populate: { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' } },
      ])
      .lean();
  }

  async update(query: FilterQuery<CommentDocument>, updateQuery: UpdateQuery<CommentDocument>) {
    return await this.commentModel
      .findOneAndUpdate(query, updateQuery, { new: true })
      .populate({ path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' })
      .lean();
  }
}
