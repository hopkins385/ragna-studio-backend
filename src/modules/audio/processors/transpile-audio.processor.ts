import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    let progress = 0;
    console.log('Processing audio', job.name);
    // wait for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return {};
  }
}
