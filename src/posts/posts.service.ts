import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/base.service';
import { PostDocument, Posts } from './posts.schema';

@Injectable()
export class PostsService extends BaseService {
  constructor(@InjectModel(Posts.name) private postModel: Model<PostDocument>) {
    super(postModel);
  }

  async findAllPosts(query: any): Promise<Posts[]> {
    return await this.postModel.find(query).populate([
      {
        path: 'comments',
        select: 'content',
        populate: { path: 'creator', select: 'firstName lastName avatar' },
      },
      {
        path: 'likes',
        select: 'firstName lastName avatar',
      },
    ]);
  }

  async updatePost(postId: string, query: any) {
    return await this.postModel
      .findOneAndUpdate({ _id: postId }, query, { new: true })
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
      ]);
  }
}
