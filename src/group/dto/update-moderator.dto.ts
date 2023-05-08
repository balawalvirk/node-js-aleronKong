import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateModeratorDto {
  @IsOptional()
  @IsString()
  nickName: string;

  @IsOptional()
  @IsBoolean()
  acceptMemberRequests: boolean;

  @IsOptional()
  @IsBoolean()
  removeMembers: boolean;

  @IsOptional()
  @IsBoolean()
  banMembers: boolean;

  @IsOptional()
  @IsBoolean()
  deletePosts: boolean;

  @IsOptional()
  @IsBoolean()
  pinPosts: boolean;

  @IsOptional()
  @IsBoolean()
  deleteComments: boolean;
}
