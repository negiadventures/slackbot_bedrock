import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { BedrockService } from '../bedrock/bedrock.service';

describe('AppController', () => {
  let appController: AppController;
  let bedrockService: BedrockService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [BedrockService],
    }).compile();

    appController = app.get<AppController>(AppController);
    bedrockService = app.get<BedrockService>(BedrockService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getResponseFromAgent', () => {
    it('should call bedrockService.askQuestion with the provided prompt and kb, and return the response with the sessionId', async () => {
      const sessionId = 'session-id';
      const prompt = 'question';
      const kb = 'kb';

      jest.spyOn(bedrockService, 'askQuestion').mockResolvedValue('response');

      const result = await appController.getResponseFromAgent(
        sessionId,
        { prompt },
        kb,
      );

      expect(bedrockService.askQuestion).toHaveBeenCalledWith(prompt, kb);
      expect(result).toEqual({ message: 'response', sessionId });
    });
  });
});
