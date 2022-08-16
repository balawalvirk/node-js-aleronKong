import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/base.service';
import { Comment, CommentDocument } from './comments.schema';

@Injectable()
export class CommentsService extends BaseService {
  constructor(@InjectModel(Comment.name) private CommentsModal: Model<CommentDocument>) {
    super(CommentsModal);
  }
}
