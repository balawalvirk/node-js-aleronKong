import { IsMongoId } from 'class-validator';

export class BanMemberDto {
  @IsMongoId()
  group: string;

  @IsMongoId()
  member: string;
}
