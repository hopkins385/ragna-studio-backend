import { Inject, Injectable, Logger } from '@nestjs/common';
import { SLACK_CLIENT } from './constants';
import type { SlackClient } from './slack.module';
import type { ChatPostMessageResponse } from '@slack/web-api';

interface SlackMessagePayload {
  channel: string; // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
  message: string;
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(
    @Inject(SLACK_CLIENT) private readonly slackClient: SlackClient,
  ) {}

  /**
   * @description Sends a message to a Slack channel
   */
  async sendMessage(
    payload: SlackMessagePayload,
  ): Promise<ChatPostMessageResponse> {
    try {
      const response = await this.slackClient.chat.postMessage({
        channel: payload.channel,
        text: payload.message,
      });
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error sending message to Slack: ${error.message}`);
      }

      throw error;
    }
  }

  // event listeners, etc.
  private async handleEvent(event: any): Promise<void> {
    // handle event
  }
}
