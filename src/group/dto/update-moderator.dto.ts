import { IsBoolean, IsString } from 'class-validator';

export class UpdateModeratorDto {
  @IsString()
  nickName: string;
}
