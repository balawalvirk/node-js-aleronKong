import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';
import Stripe from 'stripe';

@Injectable()
/**
 * @author Muhammad Awais
 */
export class StripeService {
  constructor(private readonly configService: ConfigService<IEnvironmentVariables>) {}

  private readonly stripe: Stripe = new Stripe.Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2022-08-01',
  });

  async createCustomer(body: Stripe.CustomerCreateParams) {
    return await this.stripe.customers.create({
      email: body.email,
    });
  }

  async updateCustomer(id: string, params?: Stripe.CustomerUpdateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.customers.update(id, params, options);
  }

  async findOneCustomer(id: string) {
    return await this.stripe.customers.retrieve(id);
  }

  async createPaymentMethod(body: Stripe.PaymentMethodCreateParams) {
    return await this.stripe.paymentMethods.create(body);
  }

  async attachPaymentMethord(paymentMethodId: string, params: Stripe.PaymentMethodAttachParams) {
    return await this.stripe.paymentMethods.attach(paymentMethodId, params);
  }

  async findAllPaymentMethords(customerId: string, params: Stripe.CustomerListPaymentMethodsParams) {
    return await this.stripe.customers.listPaymentMethods(customerId, params);
  }

  async findOnePaymentMethod(id: string) {
    return await this.stripe.paymentMethods.retrieve(id);
  }

  async deAttachPaymentMethord(paymentMethodId: string) {
    return await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async updatePaymentMethord(paymentMethodId: string, params: Stripe.PaymentMethodUpdateParams) {
    return await this.stripe.paymentMethods.update(paymentMethodId, params);
  }

  async createPaymentIntent(params: Stripe.PaymentIntentCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.paymentIntents.create(params, options);
  }

  async updatePaymentIntent(id: string, params?: Stripe.PaymentIntentUpdateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.paymentIntents.update(id, params, options);
  }

  async createProduct(params: Stripe.ProductCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.products.create(params, options);
  }

  async updateProduct(id: string, params?: Stripe.ProductUpdateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.products.update(id, params, options);
  }

  async findOneProduct(id: string, params?: Stripe.ProductRetrieveParams, options?: Stripe.RequestOptions) {
    return await this.stripe.products.retrieve(id, params, options);
  }

  async createPrice(params: Stripe.PriceCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.prices.create(params, options);
  }

  async updatePrice(id: string, params?: Stripe.PriceUpdateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.prices.update(id, params, options);
  }

  async createSubscription(params: Stripe.SubscriptionCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.subscriptions.create(params, options);
  }

  async findAllSubscriptions(params?: Stripe.SubscriptionListParams, options?: Stripe.RequestOptions) {
    return await this.stripe.subscriptions.list(params, options);
  }

  async findOneSubscription(id: string, params?: Stripe.SubscriptionRetrieveParams, options?: Stripe.RequestOptions) {
    return await this.stripe.subscriptions.retrieve(id, params, options);
  }

  async cancelSubscription(id: string, params?: Stripe.SubscriptionDeleteParams, options?: Stripe.RequestOptions) {
    return await this.stripe.subscriptions.del(id, params, options);
  }

  async findAllInvoices(params?: Stripe.InvoiceListParams, options?: Stripe.RequestOptions) {
    return await this.stripe.invoices.list(params, options);
  }

  async createAccount(params?: Stripe.AccountCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.accounts.create(params, options);
  }

  async updateAccount(id: string, params?: Stripe.AccountUpdateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.accounts.update(id, params, options);
  }

  async deleteAccount(id: string, params?: Stripe.AccountDeleteParams, options?: Stripe.RequestOptions) {
    return await this.stripe.accounts.del(id, params, options);
  }

  async createTransfer(params: Stripe.TransferCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.transfers.create(params, options);
  }

  async findAllTransfers(params?: Stripe.TransferListParams, options?: Stripe.RequestOptions) {
    return await this.stripe.transfers.list(params, options);
  }

  async createBankAccount(id: string, params: Stripe.ExternalAccountCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.accounts.createExternalAccount(id, params, options);
  }

  async deleteBankAccount(accountId: string, id: string, params?: Stripe.ExternalAccountDeleteParams, options?: Stripe.RequestOptions) {
    return await this.stripe.accounts.deleteExternalAccount(accountId, id, params, options);
  }

  async findAllBankAccounts(id: string, params?: Stripe.ExternalAccountListParams, options?: Stripe.RequestOptions) {
    return await this.stripe.accounts.listExternalAccounts(id, params, options);
  }

  async updateBankAccount(accountId: string, id: string, params?: Stripe.ExternalAccountUpdateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.accounts.updateExternalAccount(accountId, id, params, options);
  }

  async createBankToken(params?: Stripe.TokenCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.tokens.create(params, options);
  }

  async createRefund(params?: Stripe.RefundCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.refunds.create(params, options);
  }

  async createPayout(params: Stripe.PayoutCreateParams, options?: Stripe.RequestOptions) {
    return await this.stripe.payouts.create(params, options);
  }

  async findConnectedAccountBalance(account: string) {
    return await this.stripe.balance.retrieve({ stripeAccount: account });
  }

  async findConnectedAccountTransactions(account: string) {
    //@ts-ignore
    return await this.stripe.balanceTransactions.list({ stripeAccount: account, limit: 3 });
  }
}
