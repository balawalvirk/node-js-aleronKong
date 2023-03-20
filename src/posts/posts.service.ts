import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
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
        options: { sort: { createdAt: -1 } },
        populate: { path: 'creator', select: 'firstName lastName avatar isGuildMember userName' },
        select: '-post',
      },
      {
        path: 'likes',
        select: 'firstName lastName avatar',
      },
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId fcmToken' },
      { path: 'group', select: 'name' },
      { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
      { path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } },
    ];
  }

  async find(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
    return await this.postModel.find(query, {}, options).populate(this.getPopulateFields()).lean();
  }

  async update(query: FilterQuery<PostDocument>, updateQuery: UpdateQuery<PostDocument>) {
    return await this.postModel.findOneAndUpdate(query, updateQuery, { new: true }).populate(this.getPopulateFields()).lean();
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
}
