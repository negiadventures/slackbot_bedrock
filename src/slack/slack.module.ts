import { Module } from '@nestjs/common';
import { BedrockModule } from '../bedrock/bedrock.module';
import { SlackService } from './slack.service';

@Module({
  imports: [BedrockModule],
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}
