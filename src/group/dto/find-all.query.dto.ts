import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class FindAllQueryDto {
  @IsOptional()
  type: string;

  @IsOptional()
  query: string = '';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  showModeratorGroups: boolean;
}
