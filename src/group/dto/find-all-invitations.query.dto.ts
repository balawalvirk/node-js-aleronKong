import { IsOptional } from 'class-validator';

export class FindAllInvitationsQueryDto {
  @IsOptional()
  group: string;

  @IsOptional()
  friend: string;
}
