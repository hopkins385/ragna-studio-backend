import { Module } from '@nestjs/common';
import { CacheManagerController } from './cache-manager.controller';

@Module({
  controllers: [CacheManagerController]
})
export class CacheManagerModule {}
