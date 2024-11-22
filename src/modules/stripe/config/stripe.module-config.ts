import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './../stripe.service';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './stripe.module-definition';

@Module({
  providers: [
    StripeService,
    {
      provide: MODULE_OPTIONS_TOKEN,
      useValue: {}, // This will be overridden by the async config
    },
  ],
  exports: [StripeService, MODULE_OPTIONS_TOKEN],
  imports: [ConfigModule],
})
export class StripeModuleConfig extends ConfigurableModuleClass {}
