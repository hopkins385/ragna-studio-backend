//@ts-nocheck
import { LargeLangModel } from '@prisma/client';

interface LargeLangModelCapabilities {
  streamText: boolean;
  useTool: boolean;
  imageInput: boolean;
  imageOutput: boolean;
  audioInput: boolean;
  audioOutput: boolean;
  videoInput: boolean;
  videoOutput: boolean;
}

interface LargeLangModelTokenPrice {
  quantity: number;
  credits: number;
}

interface LargeLangModelCost {
  inputTokens: LargeLangModelTokenPrice;
  outputTokens: LargeLangModelTokenPrice;
}

interface LlmProviderBase {
  name: string;
  region: string;
}

interface LargeLangModelHost extends LlmProviderBase {} // Cloud provider hosting the model
interface LargeLangModelProvider extends LlmProviderBase {} // OEM of the model

/**
 * @property {number} sizeIndex - Value between 0 and 100
 * @property {number} qualityIndex - Value between 0 and 100
 * @property {number} speedIndex - Value between 0 and 100
 */
interface LargeLangModelFrontend {
  id: string;
  displayName: string;
  sizeIndex: number;
  qualityIndex: number;
  speedIndex: number;
  contextSize: number;
  maxTokens: number;
  provider: LargeLangModelProvider;
  host: LargeLangModelHost;
  capability: LargeLangModelCapabilities;
  cost: LargeLangModelCost;
}

export class LlmListResponse {
  llms: LargeLangModelFrontend[] = [];

  constructor(llmsInput: LargeLangModel[]) {
    llmsInput.map((llm) => {
      this.llms.push({
        id: llm.id,
        displayName: llm.displayName ?? 0,
        sizeIndex: llm?.sizeIndex ?? 0,
        qualityIndex: llm?.qualityIndex ?? 0,
        speedIndex: llm?.speedIndex ?? 0,
        contextSize: llm?.contextSize ?? 0,
        maxTokens: llm?.maxTokens ?? 0,
        provider: {
          name: llm.provider ?? '',
          region: llm.provider?.region ?? '',
        },
        host: {
          name: llm.host?.name ?? llm.provider ?? '',
          region: llm.host?.region ?? '',
        },
        capability: {
          streamText: llm.capabilities?.streamText ?? false,
          useTool: llm.capabilities?.useTool ?? false,
          imageInput: llm.capabilities?.imageInput ?? false,
          imageOutput: llm.capabilities?.imageOutput ?? false,
          audioInput: llm.capabilities?.audioInput ?? false,
          audioOutput: llm.capabilities?.audioOutput ?? false,
          videoInput: llm.capabilities?.videoInput ?? false,
          videoOutput: llm.capabilities?.videoOutput ?? false,
        },
        cost: {
          inputTokens: {
            quantity: llm.cost?.inputTokens?.quantity ?? 0,
            credits: llm.cost?.inputTokens?.credits ?? 0,
          },
          outputTokens: {
            quantity: llm.cost?.outputTokens?.quantity ?? 0,
            credits: llm.cost?.outputTokens?.credits ?? 0,
          },
        },
      });
    });
  }

  static from(llms: LargeLangModel[]): LlmListResponse {
    return new LlmListResponse(llms);
  }
}
