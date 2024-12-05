import { Module } from '@nestjs/common';
import { SlackModule } from './slack/slack.module';
import { AppControllerModule } from './controller/app.controller.module';
import { BedrockModule } from './bedrock/bedrock.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    SlackModule,
    AppControllerModule,
    BedrockModule,
    AppConfigModule,
  ],
})
export class AppModule {}
