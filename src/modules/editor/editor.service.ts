import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EditorCompletionBody } from './dto/editor-completion-body.dto';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { ProviderType } from '../ai-model/enums/provider.enum';
import { CoreMessage, generateText } from 'ai';

@Injectable()
export class EditorService {
  private readonly logger = new Logger(EditorService.name);

  constructor(private readonly aiModelFactory: AiModelFactory) {}

  async completion(body: EditorCompletionBody) {
    const model = this.aiModelFactory
      .setConfig({
        provider: ProviderType.OPENAI,
        model: 'gpt-4o-mini',
      })
      .getModel();

    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: `You are a helpful assistant. 
You are helping a user write a document.
The user has provided you with the document text and a selected text.
You need to generate a completion for the user based on the selected text.
The document text is the context in which the selected text appears.
The user has also provided you instructions on what to do.
The user is asking you to generate a completion that is helpful and relevant to the document text and the selected text.
The user is expecting you to generate a completion that is well-written and informative.
The user is expecting you to generate a completion that is coherent and logical.
The user is expecting you to generate a completion that is engaging and interesting.
The user is expecting you to generate a completion that is accurate and correct.
The user is expecting you to generate a completion that is concise and to the point.
The user is expecting you to generate a completion that is well-structured and well-organized.
The user is expecting you to generate a completion that is free of grammatical errors.
The user is expecting you to generate a completion that is in markdown format.
You never provide any additional information to the user.
You never ask the user any questions.
You never engage in any form of dialogue with the user.
You never provide any feedback to the user.
You never provide any comments to the user.
You never provide any suggestions to the user.
You never provide any explanations to the user.
You never provide any justifications to the user.
You never provide any reasoning to the user.
You never encapsulate the completion text in any other text or content or code blocks.
You always keep the structure (heading, paragraph, lists and so on) of the completion text consistent with the structure of the document text.
You always only use markdown syntax in the completion text.
<documentText>
${body.context}
</documentText>`,
      },
      {
        role: 'user',
        content: `<instructions>${body.prompt}</instructions> 
<selectedText>
${body.selectedText}
</selectedText>`,
      },
    ];

    const { text } = await generateText({
      model,
      messages,
      maxSteps: 1,
      maxRetries: 3,
    });

    return text.trim();
  }
}
