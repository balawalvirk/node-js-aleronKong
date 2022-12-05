import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { PostDocument, Posts } from './posts.schema';

@Injectable()
export class PostsService extends BaseService {
  constructor(@InjectModel(Posts.name) private postModel: Model<PostDocument>) {
    super(postModel);
  }

  async findAllPosts(query: FilterQuery<any>, options?: QueryOptions<any>) {
    return await this.postModel
      .find(query, {}, options)
      .populate([
        {
          path: 'comments',
          select: 'content',
          populate: { path: 'creator', select: 'firstName lastName avatar' },
        },
        {
          path: 'likes',
          select: 'firstName lastName avatar',
        },
        { path: 'creator', select: 'firstName lastName avatar userName isGuildMember' },
        { path: 'group', select: 'name' },
      ])
      .sort({ createdAt: -1 });
  }

  async updatePost(postId: string, query: any) {
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
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember' },
      { path: 'group', select: 'name' },
    ]);
  }

  async createPost(query: FilterQuery<any>) {
    return (await this.postModel.create(query)).populate([
      { path: 'fundraising' },
      { path: 'creator', select: 'firstName lastName avatar userName isGuildMember' },
    ]);
  }
}
