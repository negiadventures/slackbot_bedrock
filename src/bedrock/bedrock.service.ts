import { Injectable, Logger } from '@nestjs/common';

import { AmazonKnowledgeBaseRetriever } from '@langchain/community/retrievers/amazon_knowledge_base';

import { createRetrievalChain } from 'langchain/chains/retrieval';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { Bedrock } from '@langchain/community/llms/bedrock';

import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime';

@Injectable()
export class BedrockService {
  private readonly logger = new Logger(this.constructor.name);

  async askQuestion(q: string, kb: string, sessionId?: string) {
    if (kb === 'slackbot_playground') {
      return await this.performAgentAction(q, kb, sessionId);
    }
    const retriever = this.getRetriever(kb);
    // const docs = await retriever.invoke(prompt);
    const llm = new Bedrock({
      model: 'anthropic.claude-v2:1',
      temperature: 0,
      // top_k: 10,
      maxTokens: 1000,
      region: process.env.AWS_REGION,
      modelKwargs: {
        temperature: 0,
        top_k: 5,
        max_tokens_to_sample: 1000,
      },
    });
    const prompt = ChatPromptTemplate.fromTemplate(
      `Answer the user's question in the same language as the question: {context} {input} 

      Assistant:`,
    );
    const combineDocsChain = await createStuffDocumentsChain({
      llm,
      prompt,
    });
    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever,
    });
    q = q.replace(`${kb} `, '');
    const result = await retrievalChain.invoke({
      input: q,
      context: '',
    });
    this.logger.debug(result);
    return result.answer;
  }

  getRetriever(kb: string): any {
    let kbID;
    switch (kb) {
      case 'company_features':
        kbID = process.env.BEDROCK_COMPANY_KB_ID;
        break;
      case 'music_features':
        kbID = process.env.BEDROCK_MUSIC_KB_ID;
        break;
      case 'sports_features':
        kbID = process.env.BEDROCK_SPORTS_KB_ID;
        break;
      // topics related to api-docs
      // return new AmazonKendraRetriever({
      //   topK: 10,
      //   indexId: 'ff61d72c-db9f-44ec-ae07-7025557a7b1f',
      //   region: 'us-east-1',
      // });
      default:
        break;
    }
    return new AmazonKnowledgeBaseRetriever({
      topK: 10,
      knowledgeBaseId: kbID,
      region: process.env.AWS_REGION,
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  async performAgentAction(
    q: string,
    tag: string,
    sessionId: string,
  ): Promise<string> {
    this.logger.debug(`q: ${q.replace(`${tag} `, '')}`);
    const result = await this.invokeBedrockAgent(
      q.replace(`${tag} `, ''),
      sessionId,
    );
    this.logger.debug(`result: ${JSON.stringify(result)}`);
    return result.completion;
  }

  async invokeBedrockAgent(prompt: string, sessionId: string) {
    this.logger.debug(prompt);
    const client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION,
    });
    const agentId = process.env.AGENT_ID;
    this.logger.debug(agentId);
    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId: process.env.AGENT_ALIAS_ID,
      sessionId,
      inputText: prompt,
    });
    try {
      let completion = '';
      const response = await client.send(command);
      this.logger.debug(`response: ${JSON.stringify(response)}`);

      if (response.completion === undefined) {
        throw new Error('Completion is undefined');
      }

      for await (const chunkEvent of response.completion) {
        const chunk = chunkEvent.chunk;
        const decodedResponse = new TextDecoder('utf-8').decode(chunk.bytes);
        this.logger.debug(decodedResponse);
        completion += decodedResponse;
      }

      return { sessionId: sessionId, completion };
    } catch (err) {
      this.logger.error(err);
    }
  }
}
