import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeModuleConfig } from './config/stripe.module-config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import stripeFactory from './config/stripe.config-factory';

@Module({
  imports: [
    StripeModuleConfig.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: stripeFactory,
    }),
  ],
  controllers: [StripeController],
  exports: [StripeModuleConfig],
})
export class StripeModule {}
