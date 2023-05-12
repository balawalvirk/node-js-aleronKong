import { IsMongoId, IsOptional } from 'class-validator';

export class FindAllFriendRequestsQueryDto {
  @IsOptional()
  @IsMongoId()
  receiver: string;
}
