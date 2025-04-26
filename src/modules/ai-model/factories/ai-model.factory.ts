import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import {
  ProviderClass,
  ProviderModelConfig,
} from '@/modules/ai-model/interfaces/provider-model.interface';
import {
  AiModelProvider,
  AiModelProviderOptions,
} from '@/modules/ai-model/schemas/aiModelProvider';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LanguageModelV1 } from 'ai';

class OpenAIProvider extends AiModelProvider {
  createModel() {
    const openai = createOpenAI({
      compatibility: 'strict',
      apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY'),
    });
    return openai(this.model, {
      structuredOutputs: this.options.structuredOutputs,
      simulateStreaming: this.options.simulateStreaming,
      parallelToolCalls: this.options.parallelToolCalls,
    });
  }
}

class AnthropicProvider extends AiModelProvider {
  createModel() {
    const anthropic = createAnthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
    return anthropic(this.model, {
      // structuredOutputs: this.options.structuredOutputs, // not supported?
    });
  }
}

class GroqProvider extends AiModelProvider {
  createModel() {
    const groq = createOpenAI({
      compatibility: 'compatible',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: this.config.get<string>('GROQ_API_KEY'),
    });
    return groq(this.model, {
      structuredOutputs: this.options.structuredOutputs,
      simulateStreaming: this.options.simulateStreaming,
      parallelToolCalls: this.options.parallelToolCalls,
    });
  }
}

class MistralProvider extends AiModelProvider {
  createModel() {
    const mistral = createMistral({
      apiKey: this.config.get<string>('MISTRAL_API_KEY'),
    });
    return mistral(this.model, {
      // structuredOutputs: this.options.structuredOutputs, // not supported?
    });
  }
}

class NvidiaProvider extends AiModelProvider {
  createModel() {
    const nvidia = createOpenAI({
      compatibility: 'compatible',
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: this.config.get<string>('NVIDIA_API_KEY'),
    });
    return nvidia(this.model, {
      structuredOutputs: this.options.structuredOutputs,
      simulateStreaming: this.options.simulateStreaming,
      parallelToolCalls: this.options.parallelToolCalls,
    });
  }
}

class GoogleProvider extends AiModelProvider {
  createModel() {
    const google = createGoogleGenerativeAI({
      apiKey: this.config.get<string>('GOOGLE_GEMINI_API_KEY'),
    });
    return google(this.model, {
      structuredOutputs: this.options.structuredOutputs,
    });
  }
}

export class AiModelFactory {
  private readonly logger = new Logger(AiModelFactory.name);
  private provider: ProviderType;
  private model: string;
  private options: AiModelProviderOptions;

  // Provider mapping
  private static readonly providerMap: Record<ProviderType, ProviderClass> = {
    openai: OpenAIProvider,
    anthropic: AnthropicProvider,
    groq: GroqProvider,
    mistral: MistralProvider,
    nvidia: NvidiaProvider,
    google: GoogleProvider,
  };

  constructor(private readonly config: ConfigService) {
    this.provider = ProviderType.OPENAI;
    this.model = 'gpt-4o-mini';
    this.options = {
      structuredOutputs: false,
      simulateStreaming: false,
    };
  }

  setProvider(provider: ProviderType): AiModelFactory {
    this.provider = provider;
    return this;
  }

  setModel(model: string): AiModelFactory {
    this.model = model;
    return this;
  }

  setConfig({ provider, model }: ProviderModelConfig): AiModelFactory {
    this.provider = provider;
    this.model = model;
    return this;
  }

  setOptions(options: AiModelProviderOptions): AiModelFactory {
    this.options = options;
    return this;
  }

  getModel(): LanguageModelV1 {
    const ProviderClass = AiModelFactory.providerMap[this.provider];
    if (!ProviderClass) {
      throw new Error(`Provider ${this.provider} not supported`);
    }

    return new ProviderClass(this.model, this.config, this.options).createModel();
  }
}
