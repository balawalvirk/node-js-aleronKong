import { IsOptional, IsString } from 'class-validator';

export class FindAllQueryDto {
  @IsOptional()
  @IsString({ each: true })
  type: string;

  @IsOptional()
  query: string = '';
}
