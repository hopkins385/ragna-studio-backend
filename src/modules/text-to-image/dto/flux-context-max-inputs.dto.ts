/*
# Edit or create an image with Flux Kontext Max

## OpenAPI

````yaml openapi.json post /v1/flux-kontext-max
paths:
  path: /v1/flux-kontext-max
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
                  - type: string
                    title: Prompt
                    description: Text prompt for image generation.
                    example: ein fantastisches bild
              input_image:
                allOf:
                  - anyOf:
                      - type: string
                      - type: 'null'
                    title: Input Image
                    description: Base64 encoded image to use with Kontext.
              seed:
                allOf:
                  - anyOf:
                      - type: integer
                      - type: 'null'
                    title: Seed
                    description: Optional seed for reproducibility.
                    example: 42
              aspect_ratio:
                allOf:
                  - anyOf:
                      - type: string
                      - type: 'null'
                    title: Aspect Ratio
                    description: Aspect ratio of the image between 21:9 and 9:21
              output_format:
                allOf:
                  - anyOf:
                      - $ref: '#/components/schemas/OutputFormat'
                      - type: 'null'
                    description: >-
                      Output format for the generated image. Can be 'jpeg' or
                      'png'.
                    default: png
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
              prompt_upsampling:
                allOf:
                  - type: boolean
                    title: Prompt Upsampling
                    description: >-
                      Whether to perform upsampling on the prompt. If active,
                      automatically modifies the prompt for more creative
                      generation.
                    default: false
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
            required: true
            title: FluxKontextProInputs
            refIdentifier: '#/components/schemas/FluxKontextProInputs'
            requiredProperties:
              - prompt
        examples:
          example:
            value:
              prompt: ein fantastisches bild
              input_image: <string>
              seed: 42
              aspect_ratio: <string>
              output_format: jpeg
              webhook_url: <string>
              webhook_secret: <string>
              prompt_upsampling: false
              safety_tolerance: 2
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

import { cuidSchema } from '@/common/schemas/cuid.schema';
import { baseTextToImageBodySchema } from '@/modules/text-to-image/dto/base-body.dto';
import { OutputFormat } from '@/modules/text-to-image/enum/image-out-format.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

interface IFluxKontextMaxInputsDto {
  prompt: string;
  input_image?: string | null;
  seed?: number | null;
  aspect_ratio?: string | null;
  output_format?: OutputFormat | null;
  webhook_url?: string | null;
  webhook_secret?: string | null;
  prompt_upsampling?: boolean;
  safety_tolerance?: number;
}

export class FluxKontextMaxInputsDto {
  readonly prompt: string;
  readonly input_image: string | null;
  readonly seed: number | null;
  readonly aspect_ratio: string | null;
  readonly output_format: OutputFormat | null;
  readonly webhook_url: string | null;
  readonly webhook_secret: string | null;
  readonly prompt_upsampling: boolean;
  readonly safety_tolerance: number;

  constructor(input: IFluxKontextMaxInputsDto) {
    this.prompt = input.prompt;
    this.input_image = input.input_image === undefined ? null : input.input_image;
    this.seed = input.seed === undefined ? null : input.seed;
    this.aspect_ratio = input.aspect_ratio === undefined ? null : input.aspect_ratio;
    this.output_format =
      input.output_format === undefined ? OutputFormat.JPEG : input.output_format;
    this.webhook_url = input.webhook_url === undefined ? null : input.webhook_url;
    this.webhook_secret = input.webhook_secret === undefined ? null : input.webhook_secret;
    this.prompt_upsampling =
      input.prompt_upsampling === undefined ? false : input.prompt_upsampling;
    this.safety_tolerance = input.safety_tolerance === undefined ? 2 : input.safety_tolerance;
  }

  static fromInput(input: IFluxKontextMaxInputsDto): FluxKontextMaxInputsDto {
    return new FluxKontextMaxInputsDto(input);
  }
}

// Zod Body Schema for Flux Kontext Max Inputs
export const fluxKontextMaxInputSchema = z.object({
  referenceImageIsMedia: z.boolean().optional(),
  referenceImageId: cuidSchema.optional(),
});

const bodySchema = fluxKontextMaxInputSchema.merge(baseTextToImageBodySchema);

export class FluxKontextMaxBody extends createZodDto(bodySchema) {}
