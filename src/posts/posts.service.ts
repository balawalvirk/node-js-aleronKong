import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { PostDocument, Posts } from './posts.schema';

@Injectable()
export class PostsService extends BaseService<PostDocument> {
  constructor(@InjectModel(Posts.name) private postModel: Model<PostDocument>) {
    super(postModel);
  }

  async findAllPosts(query: FilterQuery<PostDocument>, options?: QueryOptions<PostDocument>) {
    return await this.postModel.find(query, {}, options).populate([
      {
        path: 'comments',
        select: 'content',
        populate: { path: 'creator', select: 'firstName lastName avatar' },
      },
      {
        path: 'likes',
        select: 'firstName lastName avatar',
      },
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId' },
      { path: 'group', select: 'name' },
      { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
    ]);
  }

  async updatePost(postId: string, query: PostDocument) {
    return await this.postModel.findOneAndUpdate({ _id: postId }, query, { new: true }).populate([
      {
        path: 'comments',
        select: 'content',
        populate: { path: 'creator', select: 'firstName lastName avatar' },
      },
      {
        path: 'likes',
        select: 'firstName lastName avatar',
      },
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId' },
      { path: 'group', select: 'name' },
      { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
    ]);
  }

  async createPost(query: FilterQuery<PostDocument>) {
    return (await this.postModel.create(query)).populate([
      { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId' },
    ]);
  }

  async findOne(query: FilterQuery<PostDocument>) {
    return await this.postModel.findOne(query).populate([
      {
        path: 'comments',
        select: 'content',
        populate: { path: 'creator', select: 'firstName lastName avatar' },
      },
      {
        path: 'likes',
        select: 'firstName lastName avatar',
      },
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember sellerId' },
      { path: 'group', select: 'name' },
      { path: 'fundraising', populate: [{ path: 'category' }, { path: 'subCategory' }] },
    ]);
  }
}
