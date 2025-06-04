/*
# Generate an image with FLUX 1.1 [pro].

> Submits an image generation task with FLUX 1.1 [pro].

## OpenAPI

````yaml openapi.json post /v1/flux-pro-1.1
paths:
  path: /v1/flux-pro-1.1
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
                    description: Text prompt for image generation.
                    default: ''
                    example: ein fantastisches bild
              image_prompt:
                allOf:
                  - anyOf:
                      - type: string
                      - type: 'null'
                    title: Image Prompt
                    description: Optional base64 encoded image to use with Flux Redux.
              width:
                allOf:
                  - type: integer
                    multipleOf: 32
                    maximum: 1440
                    minimum: 256
                    title: Width
                    description: >-
                      Width of the generated image in pixels. Must be a multiple
                      of 32.
                    default: 1024
              height:
                allOf:
                  - type: integer
                    multipleOf: 32
                    maximum: 1440
                    minimum: 256
                    title: Height
                    description: >-
                      Height of the generated image in pixels. Must be a
                      multiple of 32.
                    default: 768
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
                    description: Optional seed for reproducibility.
                    example: 42
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
            title: FluxPro11Inputs
            refIdentifier: '#/components/schemas/FluxPro11Inputs'
        examples:
          example:
            value:
              prompt: ein fantastisches bild
              image_prompt: <string>
              width: 1024
              height: 768
              prompt_upsampling: false
              seed: 42
              safety_tolerance: 2
              output_format: jpeg
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
*/

import { baseTextToImageBodySchema } from '@/modules/text-to-image/dto/base-body.dto';
import { OutputFormat } from '@/modules/text-to-image/enum/image-out-format.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

interface IFluxProInputsDto {
  prompt?: string | null;
  image_prompt?: string | null; // Optional base64 encoded image to use with Flux Redux.
  width?: number;
  height?: number;
  prompt_upsampling?: boolean;
  seed?: number | null;
  safety_tolerance?: number;
  output_format?: OutputFormat | null;
  webhook_url?: string | null;
  webhook_secret?: string | null;
}

export class FluxProInputsDto {
  readonly prompt: string | null;
  readonly image_prompt: string | null;
  readonly width: number;
  readonly height: number;
  readonly prompt_upsampling: boolean;
  readonly seed: number | null;
  readonly safety_tolerance: number;
  readonly output_format: OutputFormat | null;
  readonly webhook_url: string | null;
  readonly webhook_secret: string | null;

  constructor(input: IFluxProInputsDto) {
    this.prompt = input.prompt === undefined ? '' : input.prompt;
    this.image_prompt = input.image_prompt === undefined ? null : input.image_prompt;
    this.width = input.width === undefined ? 1024 : input.width;
    this.height = input.height === undefined ? 768 : input.height;
    this.prompt_upsampling =
      input.prompt_upsampling === undefined ? false : input.prompt_upsampling;
    this.seed = input.seed === undefined ? null : input.seed;
    this.safety_tolerance = input.safety_tolerance === undefined ? 2 : input.safety_tolerance;
    this.output_format =
      input.output_format === undefined ? OutputFormat.JPEG : input.output_format;
    this.webhook_url = input.webhook_url === undefined ? null : input.webhook_url;
    this.webhook_secret = input.webhook_secret === undefined ? null : input.webhook_secret;
  }

  static fromInput(input: IFluxProInputsDto): FluxProInputsDto {
    return new FluxProInputsDto(input);
  }
}

// Zod Body Schema for Flux Pro Inputs
export const fluxProInputSchema = z.object({
  imagePrompt: z.string().nullable().optional(),
  width: z.number().min(1).default(1024),
  height: z.number().min(1).default(768),
});

const bodySchema = fluxProInputSchema.merge(
  baseTextToImageBodySchema.omit({
    aspectRatio: true,
  }),
);

export class FluxProBody extends createZodDto(bodySchema) {}
