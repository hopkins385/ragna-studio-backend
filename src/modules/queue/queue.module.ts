import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueName } from './enums/queue-name.enum';

const registeredQueues = new Set<QueueName>();

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
      name: QueueName.EMAIL,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {
  // TODO: clarify if this implementation is good
  // static forFeature(queueName: QueueName) {
  //   if (registeredQueues.has(queueName)) {
  //     return BullModule.registerQueue();
  //   }
  //   registeredQueues.add(queueName);
  //   return BullModule.registerQueue({
  //     name: queueName,
  //   });
  // }
}
