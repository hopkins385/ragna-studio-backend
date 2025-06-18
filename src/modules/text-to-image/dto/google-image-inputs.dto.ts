export class GoogleImageInputsDto {
  prompt: string;
  aspectRatio?: `${number}:${number}`; // Aspect ratio in the format "width:height"
  negativePrompt?: string;
  numImages?: number;
  modelName?: string;

  constructor(
    prompt: string,
    aspectRatio?: `${number}:${number}`,
    negativePrompt?: string,
    numImages?: number,
    modelName?: string,
  ) {
    this.prompt = prompt;
    this.aspectRatio = aspectRatio;
    this.negativePrompt = negativePrompt;
    this.numImages = numImages || 1; // Default to 1 image if not specified
    this.modelName = modelName || 'imagen-3.0-generate-002'; // Default model
  }

  static fromInput(obj: Partial<GoogleImageInputsDto>): GoogleImageInputsDto {
    return new GoogleImageInputsDto(
      obj.prompt || '',
      obj.aspectRatio,
      obj.negativePrompt,
      obj.numImages,
      obj.modelName,
    );
  }
}
