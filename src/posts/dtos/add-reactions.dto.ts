import { IsEnum, IsMongoId } from 'class-validator';
import { Emoji } from 'src/types';

export class AddReactionsDto {
  @IsEnum(Emoji, { each: true })
  emoji: string;

  @IsMongoId()
  post: string;
}
