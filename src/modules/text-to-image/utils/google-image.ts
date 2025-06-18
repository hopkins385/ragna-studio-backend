import { randomCUID2 } from '@/common/utils/random-cuid2';
import { GoogleImageInputsDto } from '@/modules/text-to-image/dto/google-image-inputs.dto';
import { PollingResult } from '@/modules/text-to-image/interfaces/polling-result.interface';
import { StatusResponse } from '@/modules/text-to-image/utils/flux-image';
import {
  createVertex,
  GoogleVertexImageProviderOptions,
  GoogleVertexProvider,
} from '@ai-sdk/google-vertex';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { experimental_generateImage as generateVertexImage } from 'ai';

@Injectable()
export class GoogleImageGenerator {
  private vertex: GoogleVertexProvider;

  constructor(private readonly config: ConfigService) {
    this.vertex = createVertex({
      project: this.config.getOrThrow('GOOGLE_VERTEX_PROJECT_ID'),
      location: this.config.getOrThrow('GOOGLE_VERTEX_LOCATION'),
      googleAuthOptions: {
        credentials: {
          client_email: this.config.getOrThrow('GOOGLE_VERTEX_CLIENT_EMAIL'),
          private_key: this.config.getOrThrow('GOOGLE_VERTEX_PRIVATE_KEY'),
        },
      },
    });
  }

  /**
   * Generates an image using the Google Vertex AI Image Generation API.
   * @param payload {GoogleImageInputsDto} - The input parameters for image generation.
   * @returns A promise that resolves to a PollingResult containing the generated image URL and status.
   */
  public async generateImage(payload: GoogleImageInputsDto): Promise<PollingResult> {
    const { prompt, negativePrompt, aspectRatio, numImages, modelName } = payload;

    try {
      const { image: generatedFile } = await generateVertexImage({
        model: this.vertex.image(modelName, {
          maxImagesPerCall: numImages,
        }),
        prompt,
        aspectRatio,
        maxRetries: 3,
        providerOptions: {
          vertex: {
            addWatermark: false,
            // personGeneration: 'allow_all',
            // safetySetting: 'block_none',
            negativePrompt,
          } satisfies GoogleVertexImageProviderOptions,
        },
      });

      const id = randomCUID2();
      const buffer = Buffer.from(generatedFile.base64, 'base64');

      return {
        id,
        imgUrl: null,
        imgBuffer: buffer,
        status: StatusResponse.Ready,
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate image`);
    }
  }
}
