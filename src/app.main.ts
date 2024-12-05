import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressReceiver } from '@slack/bolt';
import { SlackService } from './slack/slack.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const contextPath = process.env.CONTEXT_PATH;

  app.setGlobalPrefix(contextPath);
  // Slack integration
  const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  });

  const slackService = app.get(SlackService);
  slackService.initializeSlackApp(receiver);

  app.use(`/${contextPath}`, receiver.router);

  await app.listen(port);
}
bootstrap();
