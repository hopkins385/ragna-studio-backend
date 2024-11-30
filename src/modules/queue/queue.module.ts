import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { workflowProcessors } from '../assistant-job/processors/assistant-processor.config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: +config.getOrThrow<number>('REDIS_PORT'),
          password: config.getOrThrow<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'image-conversion',
    }),
    // Workflow queues
    BullModule.registerFlowProducer({
      name: 'workflow',
    }),
    BullModule.registerQueue({
      name: 'workflow-row-completed',
    }),
    ...workflowProcessors.map((p) =>
      BullModule.registerQueue({
        name: p.name,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
