// src/slack/slack.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { App, ExpressReceiver } from '@slack/bolt';
import { BedrockService } from '../bedrock/bedrock.service';

@Injectable()
export class SlackService {
  channelKbMap = {
    C0745QY5J78: 'company_features',
    C075182CPKJ: 'music_features',
    C076U1P9KQA: 'sports_features',
  };
  private readonly logger = new Logger(this.constructor.name);

  private slackApp: App;

  constructor(private bedrockService: BedrockService) {}

  initializeSlackApp(receiver: ExpressReceiver) {
    this.slackApp = new App({
      token: process.env.SLACK_BOT_TOKEN,
      receiver: receiver,
    });

    this.initializeListeners();
    // this.setupEventsEndpoint(receiver); // Setup the /slack/events endpoint

    this.logger.log('⚡️ Slack Bolt app initialized!');
  }

  private initializeListeners() {
    this.slackApp.message(async ({ message, say }) => {
      const isBotAsked = message['text'].includes('@U073XUCPRRD');
      this.logger.debug({ message });
      if (isBotAsked) {
        await say(
          await this.bedrockService.askQuestion(
            message['text'],
            this.channelKbMap[message['channel']],
            message['user'], // TODO: SESSION_ID
          ),
        );
      } else {
        this.logger.debug('Bot not called');
      }
    });
  }

  async sendMessage(channel: string, text: string) {
    try {
      await this.slackApp.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel,
        text,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return { success: false, error: error.message };
    }
  }
}
