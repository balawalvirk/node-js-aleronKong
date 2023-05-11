import { IsMongoId } from 'class-validator';

export class CreateInvitationDto {
  @IsMongoId()
  group: string;

  @IsMongoId()
  friend: string;
}
