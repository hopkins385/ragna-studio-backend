import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { experimental_transcribe as transcribe } from 'ai';

@Injectable()
export class SpeechToTextService {
  private readonly logger = new Logger(SpeechToTextService.name);
  private readonly openai: OpenAIProvider;

  constructor(private readonly configService: ConfigService) {
    this.openai = createOpenAI({
      compatibility: 'strict',
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async transcribeAudio(payload: { audioFile: Express.Multer.File }): Promise<string> {
    if (!payload.audioFile) {
      throw new Error('No audio file provided');
    }
    if (!payload.audioFile.buffer) {
      throw new Error('Audio file buffer is empty');
    }

    try {
      const transcript = await transcribe({
        model: this.openai.transcription('whisper-1'), // gpt-4o-mini-transcribe
        audio: payload.audioFile.buffer,
      });
      return transcript.text;
      // TODO: track token usage
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error transcribing audio file: ${errMsg}`);
      return '';
    }
  }
}
