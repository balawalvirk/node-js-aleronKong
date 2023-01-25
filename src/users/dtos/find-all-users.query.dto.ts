import { IsEnum, IsOptional } from 'class-validator';
import { UserRoles } from 'src/types';

export class FindAllUsersQueryDto {
  @IsOptional()
  page: string;

  @IsOptional()
  limit: string;

  @IsOptional()
  query: string = '';

  @IsOptional()
  @IsEnum(UserRoles, { each: true })
  role: string;
}
