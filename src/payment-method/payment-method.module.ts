import { Module } from '@nestjs/common';
import { PaymentMethodController } from './payment-method.controller';
import { StripeService } from 'src/helpers';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [PaymentMethodController],
  providers: [StripeService],
})
export class PaymentMethodModule {}
