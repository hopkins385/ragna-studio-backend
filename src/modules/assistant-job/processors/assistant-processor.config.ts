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
    name: 'groq-llama-3.2-11b-vision-preview',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: groqReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'groq-llama-3.1-70b-versatile',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: groqReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'groq-mixtral-8x7b-32768',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: groqReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'mistral-mistral-large-latest',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: mistralReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'openai-gpt-4o',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: openaiReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'openai-gpt-4o-mini',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: openaiReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'anthropic-claude-3-5-sonnet-latest',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: claudeReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'anthropic-claude-3-5-sonnet-20240620',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: claudeReqPerMin, duration: rateLimitDuration },
    },
  },
  {
    name: 'anthropic-claude-3-opus-20240229',
    options: {
      concurrency: workerConcurrency,
      limiter: { max: claudeReqPerMin, duration: rateLimitDuration },
    },
  },
];
