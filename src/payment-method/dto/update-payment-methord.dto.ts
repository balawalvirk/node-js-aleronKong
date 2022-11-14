import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethordDto } from './create-payment-methord.dto';

export class UpdatePaymentMethordDto extends PartialType(CreatePaymentMethordDto) {}
