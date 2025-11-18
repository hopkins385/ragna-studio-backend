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
   * Generates images using the Google Vertex AI Image Generation API.
   * @param payload {GoogleImageInputsDto} - The input parameters for image generation.
   * @returns A promise that resolves to an array of PollingResult containing the generated images and status.
   */
  public async generateImage(payload: GoogleImageInputsDto): Promise<PollingResult[]> {
    const { prompt, negativePrompt, aspectRatio, numImages, modelName } = payload;

    const vertexProviderOptions: GoogleVertexImageProviderOptions = {
      addWatermark: false,
      negativePrompt,
      // personGeneration: 'allow_all',
      // safetySetting: 'block_none',
    };

    try {
      const { images } = await generateVertexImage({
        model: this.vertex.image(modelName, {
          maxImagesPerCall: 4, // Set maximum images per call, default is 4
        }),
        prompt,
        aspectRatio,
        n: numImages, // Request multiple images
        maxRetries: 3,
        providerOptions: {
          vertex: vertexProviderOptions,
        },
      });

      // Map each generated image to a PollingResult
      return images.map((generatedFile) => {
        const id = randomCUID2();
        const buffer = Buffer.from(generatedFile.base64, 'base64');

        return {
          id,
          imgUrl: null,
          imgBuffer: buffer,
          status: StatusResponse.Ready,
        };
      });
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate image`);
    }
  }
}
