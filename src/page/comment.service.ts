import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import {PageComment, PageCommentDocument} from "src/page/comment.schema";

@Injectable()
export class PageCommentService extends BaseService<PageCommentDocument> {
  constructor(@InjectModel(PageComment.name) private commentModel: Model<PageCommentDocument>) {
    super(commentModel);
  }

  async create(query: FilterQuery<PageCommentDocument>) {
    return await (
      await this.commentModel.create(query)
    ).populate([
      { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
      { path: 'mentions', select: 'firstName lastName avatar' },
    ]);
  }

  getRepliesPopulateFields() {
    return {
      path: 'replies',
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
        { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
      ],
    };
  }

  async find(query: FilterQuery<PageCommentDocument>, options?: QueryOptions<PageCommentDocument>) {
    return await this.commentModel.find(query, {}, options).populate([
      { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
      { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
      { path: 'mentions', select: 'firstName lastName avatar' },

      // populate replies upto 4 levels
      {
        // first level of population
        path: 'replies',
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
          { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
          { path: 'mentions', select: 'firstName lastName avatar' },
          // second level of population
          {
            path: 'replies',
            options: { sort: { createdAt: -1 } },
            populate: [
              { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
              { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
              { path: 'mentions', select: 'firstName lastName avatar' },
              // third level of population
              {
                path: 'replies',
                options: { sort: { createdAt: -1 } },
                populate: [
                  { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                  { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
                  { path: 'mentions', select: 'firstName lastName avatar' },
                  //  fourth level of population
                  {
                    path: 'replies',
                    options: { sort: { createdAt: -1 } },
                    populate: [
                      { path: 'creator', select: 'firstName lastName avatar isGuildMember userName fcmToken enableNotifications' },
                      { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
                      { path: 'mentions', select: 'firstName lastName avatar' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  }

  async update(query: FilterQuery<PageCommentDocument>, updateQuery: UpdateQuery<PageCommentDocument>) {
    return await this.commentModel.findOneAndUpdate(query, updateQuery, { new: true }).populate([
      { path: 'creator', select: 'firstName lastName avatar' },
      { path: 'mentions', select: 'firstName lastName avatar' },
    ]);
  }
}
