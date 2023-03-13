import { IsEnum, IsMongoId, IsString } from 'class-validator';
import { Reactions } from 'src/types';

export class AddRemoveReactionsDto {
  @IsEnum(Reactions, { each: true })
  reaction: string;

  @IsMongoId()
  message: string;
}
