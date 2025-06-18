import { waitFor } from '@/common/utils/waitFor';
import { FluxKontextMaxInputsDto } from '@/modules/text-to-image/dto/flux-context-max-inputs.dto';
import { FluxKontextProInputsDto } from '@/modules/text-to-image/dto/flux-context-pro-inputs.dto';
import { PollingResult } from '@/modules/text-to-image/interfaces/polling-result.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FluxProInputsDto } from '../dto/flux-pro-inputs.dto';
import { FluxUltraInputsDto } from '../dto/flux-ultra-inputs.dto';

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

export enum StatusResponse {
  TaskNotFound = 'Task not found',
  Pending = 'Pending',
  RequestModerated = 'Request Moderated',
  ContentModerated = 'Content Moderated',
  Ready = 'Ready',
  Error = 'Error',
}

type GenerateFluxImageRequest =
  | FluxProInputsDto
  | FluxUltraInputsDto
  | FluxKontextProInputsDto
  | FluxKontextMaxInputsDto;

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

  public async generateImage(request: GenerateFluxImageRequest): Promise<PollingResult> {
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

  private async createRequest(request: GenerateFluxImageRequest): Promise<GenerationResponse> {
    const isfluxPro = request instanceof FluxProInputsDto;
    const isfluxUltra = request instanceof FluxUltraInputsDto;
    const isfluxKontextPro = request instanceof FluxKontextProInputsDto;
    const isFluxKontextMax = request instanceof FluxKontextMaxInputsDto;

    let endpoint: string | null = null;
    if (isfluxPro) {
      endpoint = 'flux-pro-1.1';
    } else if (isfluxUltra) {
      endpoint = 'flux-pro-1.1-ultra';
    } else if (isfluxKontextPro) {
      endpoint = 'flux-kontext-pro';
    } else if (isFluxKontextMax) {
      endpoint = 'flux-kontext-max';
    } else {
      this.logger.error('Invalid request type');
      throw new Error('Invalid request type');
    }

    if (!endpoint) {
      throw new Error('Invalid request');
    }

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    const body = JSON.stringify(request);

    this.logger.debug(`Creating request to ${url}`);

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
