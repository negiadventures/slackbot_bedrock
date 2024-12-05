import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BedrockModule } from '../bedrock/bedrock.module';

@Module({
  imports: [BedrockModule],
  controllers: [AppController],
})
export class AppControllerModule {}
