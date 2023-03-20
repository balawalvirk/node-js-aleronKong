import { IsBoolean, IsMongoId, IsString } from 'class-validator';

export class CreateModeratorDto {
  @IsString()
  nickName: string;

  @IsMongoId()
  user: string;

  @IsBoolean()
  acceptMemberRequests: boolean;

  @IsBoolean()
  removeMembers: boolean;

  @IsBoolean()
  banMembers: boolean;

  @IsBoolean()
  deletePosts: boolean;

  @IsBoolean()
  pinPosts: boolean;

  @IsBoolean()
  deleteComments: boolean;

  @IsMongoId()
  group: string;
}
