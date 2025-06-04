/*
# Generate an image with FLUX 1.1 [pro] with ultra mode and optional raw mode.

> Submits an image generation task with FLUX 1.1 [pro] with ultra mode and optional raw mode.

## OpenAPI

````yaml openapi.json post /v1/flux-pro-1.1-ultra
paths:
  path: /v1/flux-pro-1.1-ultra
  method: post
  servers:
    - url: https://api.bfl.ai
      description: BFL API
  request:
    security:
      - title: APIKeyHeader
        parameters:
          query: {}
          header:
            x-key:
              type: apiKey
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              prompt:
                allOf:
                  - anyOf:
                      - type: string
                      - type: 'null'
                    title: Prompt
                    description: The prompt to use for image generation.
                    default: ''
                    example: A beautiful landscape with mountains and a lake
              prompt_upsampling:
                allOf:
                  - type: boolean
                    title: Prompt Upsampling
                    description: >-
                      Whether to perform upsampling on the prompt. If active,
                      automatically modifies the prompt for more creative
                      generation.
                    default: false
              seed:
                allOf:
                  - anyOf:
                      - type: integer
                      - type: 'null'
                    title: Seed
                    description: >-
                      Optional seed for reproducibility. If not provided, a
                      random seed will be used.
                    example: 42
              aspect_ratio:
                allOf:
                  - type: string
                    title: Aspect Ratio
                    description: Aspect ratio of the image between 21:9 and 9:21
                    default: '16:9'
              safety_tolerance:
                allOf:
                  - type: integer
                    maximum: 6
                    minimum: 0
                    title: Safety Tolerance
                    description: >-
                      Tolerance level for input and output moderation. Between 0
                      and 6, 0 being most strict, 6 being least strict.
                    default: 2
                    example: 2
              output_format:
                allOf:
                  - anyOf:
                      - $ref: '#/components/schemas/OutputFormat'
                      - type: 'null'
                    description: >-
                      Output format for the generated image. Can be 'jpeg' or
                      'png'.
                    default: jpeg
              raw:
                allOf:
                  - type: boolean
                    title: Raw
                    description: Generate less processed, more natural-looking images
                    default: false
                    example: false
              image_prompt:
                allOf:
                  - anyOf:
                      - type: string
                      - type: 'null'
                    title: Image Prompt
                    description: Optional image to remix in base64 format
              image_prompt_strength:
                allOf:
                  - type: number
                    maximum: 1
                    minimum: 0
                    title: Image Prompt Strength
                    description: Blend between the prompt and the image prompt
                    default: 0.1
              webhook_url:
                allOf:
                  - anyOf:
                      - type: string
                        maxLength: 2083
                        minLength: 1
                        format: uri
                      - type: 'null'
                    title: Webhook Url
                    description: URL to receive webhook notifications
              webhook_secret:
                allOf:
                  - anyOf:
                      - type: string
                      - type: 'null'
                    title: Webhook Secret
                    description: Optional secret for webhook signature verification
            required: true
            title: FluxUltraInput
            refIdentifier: '#/components/schemas/FluxUltraInput'
        examples:
          example:
            value:
              prompt: A beautiful landscape with mountains and a lake
              prompt_upsampling: false
              seed: 42
              aspect_ratio: '16:9'
              safety_tolerance: 2
              output_format: jpeg
              raw: false
              image_prompt: <string>
              image_prompt_strength: 0.1
              webhook_url: <string>
              webhook_secret: <string>
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - type: string
                    title: Id
              polling_url:
                allOf:
                  - type: string
                    title: Polling Url
            title: AsyncResponse
            refIdentifier: '#/components/schemas/AsyncResponse'
            requiredProperties:
              - id
              - polling_url
          - type: object
            properties:
              id:
                allOf:
                  - type: string
                    title: Id
              status:
                allOf:
                  - type: string
                    title: Status
              webhook_url:
                allOf:
                  - type: string
                    title: Webhook Url
            title: AsyncWebhookResponse
            refIdentifier: '#/components/schemas/AsyncWebhookResponse'
            requiredProperties:
              - id
              - status
              - webhook_url
        examples:
          example:
            value:
              id: <string>
              polling_url: <string>
        description: Successful Response
    '422':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - items:
                      $ref: '#/components/schemas/ValidationError'
                    type: array
                    title: Detail
            title: HTTPValidationError
            refIdentifier: '#/components/schemas/HTTPValidationError'
        examples:
          example:
            value:
              detail:
                - loc:
                    - <string>
                  msg: <string>
                  type: <string>
        description: Validation Error
  deprecated: false
  type: path
components:
  schemas:
    OutputFormat:
      type: string
      enum:
        - jpeg
        - png
      title: OutputFormat
    ValidationError:
      properties:
        loc:
          items:
            anyOf:
              - type: string
              - type: integer
          type: array
          title: Location
        msg:
          type: string
          title: Message
        type:
          type: string
          title: Error Type
      type: object
      required:
        - loc
        - msg
        - type
      title: ValidationError

````
*/

import { baseTextToImageBodySchema } from '@/modules/text-to-image/dto/base-body.dto';
import { OutputFormat } from '@/modules/text-to-image/enum/image-out-format.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

interface IFluxUltraInputsDto {
  prompt?: string | null;
  prompt_upsampling?: boolean;
  seed?: number | null;
  aspect_ratio?: string;
  safety_tolerance?: number;
  output_format?: OutputFormat | null;
  raw?: boolean;
  image_prompt?: string | null;
  image_prompt_strength?: number;
  webhook_url?: string | null;
  webhook_secret?: string | null;
}

export class FluxUltraInputsDto {
  readonly prompt: string | null;
  readonly prompt_upsampling: boolean;
  readonly seed: number | null;
  readonly aspect_ratio: string;
  readonly safety_tolerance: number;
  readonly output_format: OutputFormat | null;
  readonly raw: boolean;
  readonly image_prompt: string | null;
  readonly image_prompt_strength: number;
  readonly webhook_url: string | null;
  readonly webhook_secret: string | null;

  constructor(input: IFluxUltraInputsDto) {
    this.prompt = input.prompt === undefined ? '' : input.prompt;
    this.prompt_upsampling =
      input.prompt_upsampling === undefined ? false : input.prompt_upsampling;
    this.seed = input.seed === undefined ? null : input.seed;
    this.aspect_ratio = input.aspect_ratio === undefined ? '16:9' : input.aspect_ratio;
    this.safety_tolerance = input.safety_tolerance === undefined ? 2 : input.safety_tolerance;
    this.output_format =
      input.output_format === undefined ? OutputFormat.JPEG : input.output_format;
    this.raw = input.raw === undefined ? false : input.raw;
    this.image_prompt = input.image_prompt === undefined ? null : input.image_prompt;
    this.image_prompt_strength =
      input.image_prompt_strength === undefined ? 0.1 : input.image_prompt_strength;
    this.webhook_url = input.webhook_url === undefined ? null : input.webhook_url;
    this.webhook_secret = input.webhook_secret === undefined ? null : input.webhook_secret;
  }

  static fromInput(input: IFluxUltraInputsDto): FluxUltraInputsDto {
    return new FluxUltraInputsDto(input);
  }
}

// Zod Body Schema for Flux Ultra Inputs
export const fluxUltraInputSchema = z.object({
  raw: z
    .boolean()
    .default(false)
    .optional()
    .describe('Generate less processed, more natural-looking images.'),
  imagePrompt: z
    .string()
    .nullable()
    .optional()
    .describe('Optional image to remix in base64 format.'),
  imagePromptStrength: z
    .number()
    .min(0)
    .max(1)
    .default(0.1)
    .optional()
    .describe('Blend between the prompt and the image prompt.'),
});

const bodySchema = fluxUltraInputSchema.merge(baseTextToImageBodySchema);

export class FluxUltraBody extends createZodDto(bodySchema) {}
