interface FluxUltraInputs {
  prompt: string;
  // Optional fields
  seed?: number; // Optional seed for reproducibility. If not provided, a random seed will be used.
  aspect_ratio?: string; // default: 16:9, Aspect ratio of the image between 21:9 and 9:21
  safety_tolerance?: number; // default: 2, Tolerance level for input and output moderation. Between 0 and 6, 0 being most strict, 6 being least strict.
  output_format?: 'jpeg' | 'png'; // default: jpeg
  raw?: boolean; // default: false, Whether to return the raw image data as a base64 string.
  image_prompt?: string; // Optional image to remix in base64 format
  image_prompt_strength?: number;
}

export class FluxUltraInputsDto {
  readonly prompt: string;
  // Optional fields
  readonly seed?: number; // Optional seed for reproducibility. If not provided, a random seed will be used.
  readonly aspect_ratio?: string; // default: 16:9, Aspect ratio of the image between 21:9 and 9:21
  readonly safety_tolerance?: number; // default: 2, Tolerance level for input and output moderation. Between 0 and 6, 0 being most strict, 6 being least strict.
  readonly output_format?: 'jpeg' | 'png'; // default: jpeg
  readonly raw?: boolean; // default: false, Whether to return the raw image data as a base64 string.
  readonly image_prompt?: string; // Optional image to remix in base64 format
  readonly image_prompt_strength?: number;

  constructor(input: FluxUltraInputs) {
    this.prompt = input.prompt;
    this.seed = input.seed;
    this.aspect_ratio = input.aspect_ratio;
    this.safety_tolerance = input.safety_tolerance;
    this.output_format = input.output_format;
    this.raw = input.raw;
    this.image_prompt = input.image_prompt;
    this.image_prompt_strength = input.image_prompt_strength;
  }

  static fromInput(input: FluxUltraInputs): FluxUltraInputsDto {
    return new FluxUltraInputsDto(input);
  }
}
