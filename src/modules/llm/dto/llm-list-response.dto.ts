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

interface LargeLangModelSupplier extends LlmProviderBase {}
interface LargeLangModelProvider extends LlmProviderBase {}

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
  supplier: LargeLangModelSupplier;
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
        supplier: {
          name: llm.supplier?.name ?? '',
          region: llm.supplier?.region ?? '',
        },
        capability: {
          streamText: llm.capability?.streamText ?? false,
          useTool: llm.capability?.useTool ?? false,
          imageInput: llm.capability?.imageInput ?? false,
          imageOutput: llm.capability?.imageOutput ?? false,
          audioInput: llm.capability?.audioInput ?? false,
          audioOutput: llm.capability?.audioOutput ?? false,
          videoInput: llm.capability?.videoInput ?? false,
          videoOutput: llm.capability?.videoOutput ?? false,
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
