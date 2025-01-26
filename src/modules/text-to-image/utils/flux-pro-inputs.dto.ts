interface FluxProInputs {
  prompt: string;
  // Optional fields
  output_format?: 'jpeg' | 'png'; // default: jpeg
  width?: number; // default: 1024, min: 256, max: 1440, multiple of 32
  height?: number; // default: 768, min: 256, max: 1440, multiple of 32
  steps?: number; // default: 40, min: 1, max: 50
  prompt_upsampling?: boolean; // default: false
  seed?: number | null; // default: null
  guidance?: number; // min: 1.5, max: 5.0, default: 2.5
  safety_tolerance?: number | null; // min: 0, max: 6, default: 2
  interval?: number; // min: 1.0, max: 4.0, default: 2.0
}

export class FluxProInputsDto {
  readonly prompt: string;
  // Optional fields
  readonly output_format?: 'jpeg' | 'png'; // default: jpeg
  readonly width?: number; // default: 1024, min: 256, max: 1440, multiple of 32
  readonly height?: number; // default: 768, min: 256, max: 1440, multiple of 32
  readonly steps?: number; // default: 40, min: 1, max: 50
  readonly prompt_upsampling?: boolean; // default: false
  readonly seed?: number | null; // default: null
  readonly guidance?: number; // min: 1.5, max: 5.0, default: 2.5
  readonly safety_tolerance?: number | null; // min: 0, max: 6, default: 2
  readonly interval?: number; // min: 1.0, max: 4.0, default: 2.0

  constructor(input: FluxProInputs) {
    this.prompt = input.prompt;
    this.output_format = input.output_format;
    this.width = input.width;
    this.height = input.height;
    this.steps = input.steps;
    this.prompt_upsampling = input.prompt_upsampling;
    this.seed = input.seed;
    this.guidance = input.guidance;
    this.safety_tolerance = input.safety_tolerance;
    this.interval = input.interval;
  }

  static fromInput(input: FluxProInputs): FluxProInputsDto {
    return new FluxProInputsDto(input);
  }
}
