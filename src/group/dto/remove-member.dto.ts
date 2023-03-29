import { IsMongoId } from 'class-validator';

export class RemoveMemberDto {
  @IsMongoId()
  group: string;

  @IsMongoId()
  member: string;
}
