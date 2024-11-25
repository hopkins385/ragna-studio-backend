import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AudioService } from './audio.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
import { Public } from '@/common/decorators/public.decorator';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post()
  create(@Body() createAudioDto: CreateAudioDto) {
    throw new Error('Method not implemented.');
    return this.audioService.create(createAudioDto);
  }
}
