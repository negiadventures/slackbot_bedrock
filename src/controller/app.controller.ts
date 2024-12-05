import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { BedrockService } from '../bedrock/bedrock.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: BedrockService,
    private readonly bedrockService: BedrockService,
  ) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('prompt/:kb')
  async getResponseFromAgent(
    @Headers('sessionId') sessionId: string,
    @Body() body: { prompt: string },
    @Param('kb') kb: string,
  ): Promise<any> {
    const response = await this.bedrockService.askQuestion(
      body.prompt,
      kb, //'#agent',
      // sessionId, // TODO: SESSION_ID
    );
    return {
      message: response,
      sessionId: sessionId,
    };
  }
}
