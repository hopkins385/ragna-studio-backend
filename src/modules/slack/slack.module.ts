import { Module } from '@nestjs/common';
import { SLACK_CLIENT, SLACK_CONFIG } from './constants';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { SlackService } from './slack.service';

export type SlackClient = WebClient;

interface SlackConfig {
  slackToken: string;
  slackRetries: number;
}

@Module({
  providers: [
    {
      provide: SLACK_CONFIG,
      useFactory: (configService: ConfigService): SlackConfig => ({
        slackToken: configService.get('SLACK_CLIENT_TOKEN'),
        slackRetries: configService.get('SLACK_CLIENT_RETRIES', 3),
      }),
      inject: [ConfigService],
    },
    {
      provide: SLACK_CLIENT,
      useFactory: (config: SlackConfig) => {
        const client = new WebClient(config.slackToken, {
          retryConfig: { retries: config.slackRetries },
        });
        return client;
      },
      inject: [SLACK_CONFIG],
    },
    SlackService,
  ],
  exports: [SLACK_CLIENT, SlackService],
})
export class SlackModule {}

// usage in a service
// @Inject(SLACK_CLIENT) private readonly slackClient: SlackClient
