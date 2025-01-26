/*interface GenerationRequest {
  prompt: string;
  width?: number; // default: 1024
  height?: number; // default: 768
  // Number of steps for the image generation process.
  steps?: number; // min: 1 max: 50, default: 40
  // Whether to perform upsampling on the prompt. If active, automatically modifies the prompt for more creative generation.
  promptUpsampling?: boolean; // default: false
  // Optional seed for reproducibility.
  seed?: number; // default: null
  // Guidance scale for image generation. High guidance scales improve prompt adherence at the cost of reduced realism.
  guidance?: number; // min: 1.5, max: 5.0, default: 2.5
  // Tolerance level for input and output moderation. Between 0 and 6, 0 being most strict, 6 being least strict.
  safetyTolerance?: number; // min: 0, max: 6, default: 2
  // Interval parameter for guidance control.
  interval?: number; // min: 1, max: 4, default: 2
}*/

import { waitFor } from '@/common/utils/waitFor';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FluxProInputsDto } from './flux-pro-inputs.dto';
import { FluxUltraInputsDto } from './flux-ultra-inputs.dto';

interface ResultResponse {
  id: string;
  status: StatusResponse;
  result?: {
    sample: string;
  };
}

interface GenerationResponse {
  id: string;
}

interface HTTPValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

interface PollingResult {
  id: string;
  imgUrl: string | null;
  status: StatusResponse;
}

export enum StatusResponse {
  TaskNotFound = 'Task not found',
  Pending = 'Pending',
  RequestModerated = 'Request Moderated',
  ContentModerated = 'Content Moderated',
  Ready = 'Ready',
  Error = 'Error',
}

type GenerateImageRequest = FluxProInputsDto | FluxUltraInputsDto;

@Injectable()
export class FluxImageGenerator {
  private readonly logger = new Logger(FluxImageGenerator.name);
  private readonly baseUrl: string = 'https://api.bfl.ml/v1';
  private readonly headers: Record<string, string>;

  constructor(private readonly config: ConfigService) {
    this.headers = {
      accept: 'application/json',
      'x-key': this.config.get<string>('FLUX_API_KEY'),
      'Content-Type': 'application/json',
    };
  }

  public async generateImage(
    request: GenerateImageRequest,
  ): Promise<PollingResult> {
    if (
      !(request instanceof FluxProInputsDto) &&
      !(request instanceof FluxUltraInputsDto)
    ) {
      throw new Error(
        'Invalid request, expected FluxProInputsDto or FluxUltraInputsDto',
      );
    }
    try {
      // Step 1: Create the generation request
      const { id } = await this.createRequest(request);

      // Step 2: Poll for the result
      return new Promise((resolve, reject) => {
        this.pollForResult(id, resolve).catch(reject);
      });
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  private async createRequest(
    request: GenerateImageRequest,
  ): Promise<GenerationResponse> {
    const fluxPro = request instanceof FluxProInputsDto;
    const fluxUltra = request instanceof FluxUltraInputsDto;
    const endpoint = fluxPro
      ? 'flux-pro-1.1'
      : fluxUltra
        ? 'flux-pro-1.1-ultra'
        : null;

    if (!endpoint) {
      throw new Error('Invalid request');
    }

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    const body = JSON.stringify(request);

    this.logger.debug(`Creating request to ${url} with body:`, body);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body,
    });

    if (!response.ok) {
      if (response.status === 422) {
        const validationError: HTTPValidationError = await response.json();
        throw new Error(`Validation error: ${JSON.stringify(validationError)}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async pollForResult(
    requestId: string,
    successResponse: (result: PollingResult) => void,
  ): Promise<void> {
    const maxPollingDuration = 10000; // 10s
    const pollingInterval = 500; // 500ms

    const getSuccessResponse = async () => {
      const { status, result } = await this.getResult(requestId);

      switch (status) {
        case StatusResponse.Ready:
          if (!result) {
            throw new Error('Result is missing');
          }
          successResponse({
            id: requestId,
            imgUrl: result.sample,
            status,
          });
          return true;
        case StatusResponse.Pending:
          return false;
        case StatusResponse.Error:
        case StatusResponse.TaskNotFound:
        case StatusResponse.RequestModerated:
        case StatusResponse.ContentModerated:
          successResponse({
            id: requestId,
            imgUrl: null,
            status,
          });
          return true;
        default:
          throw new Error(`Unexpected response status: ${status}`);
      }
    };

    await waitFor(getSuccessResponse, pollingInterval, maxPollingDuration);
  }

  private async getResult(requestId: string): Promise<ResultResponse> {
    const url = new URL(`${this.baseUrl}/get_result`);
    url.searchParams.append('id', requestId);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-key': this.config.get<string>('FLUX_API_KEY'),
      },
    });

    if (!response.ok) {
      if (response.status === 422) {
        const validationError: HTTPValidationError = await response.json();
        throw new Error(`Validation error: ${JSON.stringify(validationError)}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
