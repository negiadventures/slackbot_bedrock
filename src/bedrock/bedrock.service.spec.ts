import { BedrockService } from './bedrock.service';

jest.mock('@langchain/community/retrievers/amazon_knowledge_base', () => {
  return {
    AmazonKnowledgeBaseRetriever: jest.fn().mockImplementation(() => {
      return {
        invoke: jest.fn().mockResolvedValue({}),
      };
    }),
  };
});

jest.mock('langchain/chains/retrieval', () => {
  return {
    createRetrievalChain: jest
      .fn()
      .mockResolvedValue({ invoke: jest.fn().mockResolvedValue({}) }),
  };
});

jest.mock('langchain/chains/combine_documents', () => {
  return {
    createStuffDocumentsChain: jest.fn().mockResolvedValue({}),
  };
});

jest.mock('@aws-sdk/client-bedrock-agent-runtime', () => {
  return {
    BedrockAgentRuntimeClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockResolvedValue({}),
      };
    }),
    InvokeAgentCommand: jest.fn(),
  };
});

describe('BedrockService', () => {
  let service: BedrockService;

  beforeEach(() => {
    service = new BedrockService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('askQuestion', () => {
    it('should return answer', async () => {
      const q = 'question';
      const kb = 'knowledgeBase';
      const answer = 'answer';
      jest.spyOn(service, 'getRetriever').mockReturnValue({
        invoke: jest.fn().mockResolvedValue({ answer }),
      });

      const result = await service.askQuestion(q, kb);

      expect(result).toEqual(undefined);
    });
  });

  describe('performAgentAction', () => {
    it('should return completion', async () => {
      const q = 'question';
      const tag = 'tag';
      const sessionId = 'sessionId';
      const completion = 'completion';
      jest
        .spyOn(service, 'invokeBedrockAgent')
        .mockResolvedValue({ sessionId, completion });

      const result = await service.performAgentAction(q, tag, sessionId);

      expect(result).toEqual(completion);
    });
  });
});
