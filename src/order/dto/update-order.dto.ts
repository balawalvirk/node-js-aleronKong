import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/types';

export class UpdateOrderDto {
  @IsEnum(OrderStatus, { each: true })
  status: string;
}
