import { LLM_MODEL } from '@/modules/llm/enums/llm-model.enum';

/**
 * Workflow workers
 */
const rateLimitDuration = 60 * 1000; // 1 minute // Time in milliseconds. During this time, a maximum of max jobs will be processed.
const workerConcurrency = 10;
const groqReqPerMin = 30;
const mistralReqPerMin = 5 * 60;
const openaiReqPerMin = 5 * 1000;
const claudeReqPerMin = 4 * 1000;

export const workflowProcessors = [
  {
    name: LLM_MODEL.MISTRAL_LATEST,
    title: 'MistralLarge',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: mistralReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: LLM_MODEL.GPT_4O,
    title: 'OpenaiGpt4o',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: openaiReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: LLM_MODEL.GPT_4O_MINI,
    title: 'OpenaiGpt4oMini',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: openaiReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: LLM_MODEL.GPT_O1,
    title: 'OpenaiO1',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: openaiReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: LLM_MODEL.GPT_O3_MINI,
    title: 'OpenaiO3Mini',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: openaiReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: LLM_MODEL.SONNET_LATEST,
    title: 'AnthropicClaudeSonnetLatest',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: claudeReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: LLM_MODEL.SONNET_20240620,
    title: 'AnthropicClaudeSonnet',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: claudeReqPerMin, duration: rateLimitDuration },
    },
  },
];
