import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { PostDocument, Posts } from './posts.schema';

@Injectable()
export class PostsService extends BaseService<PostDocument> {
  constructor(@InjectModel(Posts.name) private postModel: Model<PostDocument>) {
    super(postModel);
  }

  getPopulateFields() {
    return [
      {
        path: 'comments',
        select: 'content',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'creator', select: 'firstName lastName avatar isGuildMember userName' },
      },
      {
        path: 'likes',
        select: 'firstName lastName avatar',
      },
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId' },
      { path: 'group', select: 'name' },
      { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
    ];
  }

  async find(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
    return await this.postModel.find(query, {}, options).populate(this.getPopulateFields()).lean();
  }

  async updatePost(query: FilterQuery<PostDocument>, updateQuery: UpdateQuery<PostDocument>) {
    return await this.postModel
      .findOneAndUpdate(query, updateQuery, { new: true })
      .populate(this.getPopulateFields())
      .lean();
  }

  async createPost(query: FilterQuery<PostDocument>) {
    return (await this.postModel.create(query)).populate(this.getPopulateFields());
  }

  async findOne(query: FilterQuery<PostDocument>) {
    return await this.postModel.findOne(query).populate(this.getPopulateFields()).lean();
  }

  async FindAllFundraisingProjects(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
    return await this.postModel.find(query, {}, options).select('fundraising status').populate('fundraising').lean();
  }

  async findHomePosts() {
    return await this.postModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: '$creator',
      },
      {
        $match: {
          isBlocked: false,
          status: 'active',
          $or: [
            {
              privacy: 'guildMembers',
            },
            {
              privacy: 'followers',
              'creator.friends': {
                $in: [new mongoose.Schema.Types.ObjectId('6347fe322f2915a130445870')],
              },
            },
            {
              privacy: 'public',
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: 10,
      },
      {
        $limit: 10,
      },
    ]);
  }
}
