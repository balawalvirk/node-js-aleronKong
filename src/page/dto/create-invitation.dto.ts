import { IsMongoId } from 'class-validator';

export class CreateInvitationDto {
  @IsMongoId()
  page: string;

  @IsMongoId()
  friend: string;
}
