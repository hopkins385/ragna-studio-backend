import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { AiModelProvider } from '../schemas/aiModelProvider';
import { ConfigService } from '@nestjs/config';
import {
  ProviderClass,
  ProviderModel,
} from '../interfaces/provider-model.interface';
import { Injectable } from '@nestjs/common';
import { ProviderType } from '../enums/provider.enum';

class OpenAIProvider extends AiModelProvider {
  createModel() {
    const openai = createOpenAI({
      compatibility: 'strict',
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
    return openai(this.model);
  }
}

class AnthropicProvider extends AiModelProvider {
  createModel() {
    const anthropic = createAnthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
    return anthropic(this.model);
  }
}

class GroqProvider extends AiModelProvider {
  createModel() {
    const groq = createOpenAI({
      compatibility: 'compatible',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: this.config.get<string>('GROQ_API_KEY'),
    });
    return groq(this.model);
  }
}

class MistralProvider extends AiModelProvider {
  createModel() {
    const mistral = createMistral({
      apiKey: this.config.get<string>('MISTRAL_API_KEY'),
    });
    return mistral(this.model);
  }
}

class NvidiaProvider extends AiModelProvider {
  createModel() {
    const nvidia = createOpenAI({
      compatibility: 'compatible',
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: this.config.get<string>('NVIDIA_API_KEY'),
    });
    return nvidia(this.model);
  }
}

@Injectable()
export class AiModelFactory {
  private provider: ProviderType;
  private model: string;

  // Provider mapping
  private static readonly providerMap: Record<ProviderType, ProviderClass> = {
    openai: OpenAIProvider,
    anthropic: AnthropicProvider,
    groq: GroqProvider,
    mistral: MistralProvider,
    nvidia: NvidiaProvider,
  };

  constructor(private readonly config: ConfigService) {
    this.provider = ProviderType.OPENAI;
    this.model = 'gpt-4o-mini';
  }

  setProvider(provider: ProviderType): AiModelFactory {
    this.provider = provider;
    return this;
  }

  setModel(model: string): AiModelFactory {
    this.model = model;
    return this;
  }

  setConfig({ provider, model }: ProviderModel): AiModelFactory {
    this.provider = provider;
    this.model = model;
    return this;
  }

  getModel() {
    const ProviderClass = AiModelFactory.providerMap[this.provider];
    if (!ProviderClass) {
      throw new Error(`Provider ${this.provider} not supported`);
    }

    return new ProviderClass(this.model, this.config).createModel();
  }
}
