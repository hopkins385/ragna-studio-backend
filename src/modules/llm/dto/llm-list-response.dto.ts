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

interface LargeLangModelInfos {
  sizeIndex: number;
  qualityIndex: number;
  speedIndex: number;
  contextSize: number;
  maxTokens: number;
}

interface LargeLangModelTokenPrice {
  quantity: string;
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
  description: string;
  infos: LargeLangModelInfos;
  provider: LargeLangModelProvider;
  host: LargeLangModelHost;
  capability: LargeLangModelCapabilities;
  cost: LargeLangModelCost;
}

export class LlmListResponseDto {
  llms: LargeLangModelFrontend[] = [];

  constructor(llmsInput: any[]) {
    llmsInput.map((llm) => {
      this.llms.push({
        id: llm.id,
        displayName: llm.displayName ?? '',
        description: llm.description ?? '',
        infos: {
          sizeIndex: llm.infos?.model?.sizeIndex ?? 0,
          qualityIndex: llm.infos?.model?.qualityIndex ?? 0,
          speedIndex: llm.infos?.model?.speedIndex ?? 0,
          contextSize: llm.infos?.model?.contextSize ?? 0,
          maxTokens: llm.infos?.model?.maxTokens ?? 0,
        },
        provider: {
          name: llm.infos?.provider?.name ?? '',
          region: llm.infos?.provider?.region ?? '',
        },
        host: {
          name: llm.infos?.host?.name ?? '',
          region: llm.infos?.host?.region ?? '',
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
            quantity: llm.cost?.inputTokens?.quantity ?? '',
            credits: llm.cost?.inputTokens?.credits ?? 0,
          },
          outputTokens: {
            quantity: llm.cost?.outputTokens?.quantity ?? '',
            credits: llm.cost?.outputTokens?.credits ?? 0,
          },
        },
      });
    });
  }

  static from(llms: LargeLangModel[]): LlmListResponseDto {
    return new LlmListResponseDto(llms);
  }
}
