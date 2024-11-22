// src/types/llm.types.ts
export interface LLMConfig {
  provider: 'anthropic' | 'openai';
  model: string;
  rateLimit: {
    maxConcurrent: number;
    requestsPerMinute: number;
  };
}

export const LLM_CONFIGS: LLMConfig[] = [
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-latest',
    rateLimit: {
      maxConcurrent: 5,
      requestsPerMinute: 100,
    },
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20240620',
    rateLimit: {
      maxConcurrent: 5,
      requestsPerMinute: 100,
    },
  },
  {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    rateLimit: {
      maxConcurrent: 5,
      requestsPerMinute: 100,
    },
  },
  {
    provider: 'openai',
    model: 'gpt-4',
    rateLimit: {
      maxConcurrent: 3,
      requestsPerMinute: 60,
    },
  },
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    rateLimit: {
      maxConcurrent: 3,
      requestsPerMinute: 60,
    },
  },
];
