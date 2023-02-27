import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreatePaymentMethordDto } from './dto/create-payment-methord.dto';
import { UpdatePaymentMethordDto } from './dto/update-payment-methord.dto';

@Controller('payment-method')
@UseGuards(JwtAuthGuard)
export class PaymentMethodController {
  constructor(private readonly stripeService: StripeService, private readonly userService: UsersService) {}

  @Post('create')
  async createPaymentMethord(@Body() { number, expiryMonth, expiryYear, name, cvc }: CreatePaymentMethordDto, @GetUser() user: UserDocument) {
    const paymentMethod = await this.stripeService.createPaymentMethod({
      type: 'card',
      card: {
        number: number,
        exp_month: expiryMonth,
        exp_year: expiryYear,
        cvc: cvc,
      },
      billing_details: {
        name,
      },
    });

    return await this.stripeService.attachPaymentMethord(paymentMethod.id, {
      customer: user.customerId,
    });
  }

  @Patch(':id/update')
  async updatePaymentMethord(@Param('id') id: string, @Body() { name, expiryMonth, expiryYear }: UpdatePaymentMethordDto) {
    return await this.stripeService.updatePaymentMethord(id, {
      billing_details: {
        name: name,
      },
      card: {
        exp_month: expiryMonth,
        exp_year: expiryYear,
      },
    });
  }

  @Patch(':id/default')
  async defaultPaymentMethord(@Param('id') id: string, @GetUser() user: UserDocument) {
    await this.stripeService.updateCustomer(user.customerId, {
      invoice_settings: { default_payment_method: id },
    });
    await this.userService.findOneRecordAndUpdate({ _id: user._id }, { defaultPaymentMethod: id });
    return 'Default payment method added to customer account.';
  }

  @Delete(':id/delete')
  async deletePaymentMethord(@Param('id') id: string) {
    return await this.stripeService.deAttachPaymentMethord(id);
  }

  @Get('find-all')
  async findAllPaymentMethords(@GetUser() user: UserDocument) {
    const paymentMethods = await this.stripeService.findAllPaymentMethords(user.customerId, { type: 'card' });
    return paymentMethods.data;
  }

  @Get(':id/find-one')
  async findOnePaymentMethord(@Param('id') id: string) {
    return await this.stripeService.findOnePaymentMethod(id);
  }
}
