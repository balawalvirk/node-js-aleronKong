import { IsEnum } from 'class-validator';
import { Emoji } from 'src/types';

export class UpdateReactionsDto {
  @IsEnum(Emoji, { each: true })
  emoji: string;
}
