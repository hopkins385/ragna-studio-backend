import { DynamicModule, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import {
  EMAIL_PROVIDER,
  TEMPLATE_ENGINE,
  TEMPLATE_REPOSITORY,
} from './constants/injection-tokens';
import { ConfigService } from '@nestjs/config';
import { BrevoProvider } from './providers/brevo.provider';
import { LiquidTemplateEngine } from './engines/liquid-template.engine';
import { EmailTemplateRepository } from './repositories/email-template.repository';

@Module({})
export class MailModule {
  static forRoot(options: { isGlobal: boolean }): DynamicModule {
    return {
      module: MailModule,
      global: options.isGlobal,
      providers: [
        {
          provide: EMAIL_PROVIDER,
          useFactory: (configService: ConfigService) => {
            const provider = configService.get('MAIL_PROVIDER');
            const fromEmail = configService.get('MAIL_FROM_ADDRESS');
            const fromName = configService.get('MAIL_FROM_NAME');
            switch (provider) {
              case 'brevo':
                return new BrevoProvider(
                  configService.get('BREVO_API_KEY'),
                  fromEmail,
                  fromName,
                );
              default:
                throw new Error('Invalid mail provider');
            }
          },
          inject: [ConfigService],
        },
        {
          provide: TEMPLATE_ENGINE,
          useClass: LiquidTemplateEngine,
        },
        EmailTemplateRepository,
        {
          provide: TEMPLATE_REPOSITORY,
          useExisting: EmailTemplateRepository,
        },

        MailService,
      ],
      exports: [MailService],
    };
  }
}
