import { ConfigurableModuleBuilder } from '@nestjs/common';
import { StripeModuleOptions } from './../interfaces/stripe.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<StripeModuleOptions>().setClassMethodName('forRoot').build();
