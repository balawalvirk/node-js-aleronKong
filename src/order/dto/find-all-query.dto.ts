import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/types';

export class FindAllQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, { each: true })
  status: string;
}
