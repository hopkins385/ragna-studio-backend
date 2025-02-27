import { ConfigService } from '@nestjs/config';
import { StripeModuleOptions } from '../interfaces/stripe.interface';

/**
 * Stripe module factory
 * @param config {ConfigService}
 */
const stripeFactory = (config: ConfigService): StripeModuleOptions => {
  return {
    apiKey: config.getOrThrow<string>('STRIPE_API_KEY'),
    options: {
      apiVersion: '2025-02-24.acacia',
    },
  };
};

export default stripeFactory;
