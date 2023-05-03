import { IsEnum, IsOptional } from 'class-validator';
import { PostSort } from 'src/types';

export class FindHomePostQueryDto {
  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;

  @IsOptional()
  @IsEnum(PostSort, { each: true })
  sort: string = PostSort.MOST_RECENT;
}
