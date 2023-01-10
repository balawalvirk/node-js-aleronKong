import { PartialType } from '@nestjs/mapped-types';
import { CreatePostsDto } from './create-posts';

export class UpdatePostDto extends PartialType(CreatePostsDto) {}
