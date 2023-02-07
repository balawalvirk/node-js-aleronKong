import { IsOptional } from 'class-validator';

export class FindAllNotificationsQueryDto {
  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;
}
