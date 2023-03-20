import { IsBoolean, IsString } from 'class-validator';

export class UpdateModeratorDto {
  @IsString()
  nickName: string;

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
}
