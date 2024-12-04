import { StripeModuleOptions } from './interfaces/stripe.interface';
import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { MODULE_OPTIONS_TOKEN } from './config/stripe.module-definition';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  public readonly stripe: Stripe;
  constructor(
    private readonly config: ConfigService,
    // private readonly subscriptionService: SubscriptionService,
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: StripeModuleOptions,
  ) {
    this.stripe = new Stripe(this.options.apiKey, this.options.options);
  }

  async constructEvent(sig: string, payload: any) {
    return this.stripe.webhooks.constructEventAsync(
      payload,
      sig,
      this.config.get('STRIPE_WEBHOOK_SECRET'),
    );
  }

  async handleWebhook(sig: string, payload: any) {
    const event = await this.constructEvent(sig, payload);
    const eventData = event.data.object;

    // Handle the event
    switch (event.type) {
      // Customer
      case 'customer.created':
        console.log('Customer was created., Data: ', eventData);
        // return this.subscriptionService.createSubscriptionFromEvent(event);
        break;
      case 'customer.updated':
        console.log('Customer was updated., Data: ', eventData);
        break;
      case 'customer.deleted':
        console.log('Customer was deleted., Data: ', eventData);
        break;

      // Customer subscription
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('Customer subscription was updated., Data: ', eventData);
        // return this.subscriptionService.processSubscriptionUpdate(event);
        break;
      case 'customer.subscription.deleted':
        console.log('Customer subscription was deleted., Data: ', eventData);
        break;

      // Checkout Session
      case 'checkout.session.completed':
        // Save an order in your database, marked as 'awaiting payment'
        // database

        // Check if the order is paid (for example, from a card payment)
        //
        // A delayed notification payment will have an `unpaid` status, as
        // you're still waiting for funds to be transferred from the customer's
        // account.
        // if (session.payment_status === 'paid') {
        //   fulfillOrder(session);
        // }
        break;

      case 'checkout.session.async_payment_succeeded': {
        // const session = event.data.object;
        // Fulfill the purchase...
        // fulfillOrder(session);

        break;
      }

      case 'checkout.session.async_payment_failed': {
        // const session = event.data.object;
        // Send an email to the customer asking them to retry their order
        // emailCustomerAboutFailedPayment(session);

        break;
      }

      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  async getOrCreateCustomer(userId: string, email: string, name: string) {
    // check if customer exists
    const customer = await this.stripe.customers.list({ email });
    if (customer.data.length > 0) {
      return customer.data[0];
    }
    // if not exists create customer
    return this.stripe.customers.create(
      {
        email,
        name,
      },
      {
        idempotencyKey: userId,
      },
    );
  }

  createCheckoutSession(data: any) {
    return this.stripe.checkout.sessions.create(data);
  }

  createPortalSession(data: any) {
    return this.stripe.billingPortal.sessions.create(data);
  }
}
