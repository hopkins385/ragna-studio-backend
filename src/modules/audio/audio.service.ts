import { Injectable } from '@nestjs/common';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private readonly audioQueue: Queue) {}

  async create(createAudioDto: CreateAudioDto) {
    const job = await this.audioQueue.add('transcribe', createAudioDto);
    return 'This action adds a new audio';
  }

  findAll() {
    return `This action returns all audio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} audio`;
  }

  update(id: number, updateAudioDto: UpdateAudioDto) {
    return `This action updates a #${id} audio`;
  }

  remove(id: number) {
    return `This action removes a #${id} audio`;
  }
}
