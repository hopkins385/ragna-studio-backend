import { Module } from '@nestjs/common';
import { CollectionAbleService } from './collection-able.service';
import { CollectionAbleRepository } from './repositories/collection-able.repository';
import { CollectionAbleController } from './collection-able.controller';

@Module({
  providers: [CollectionAbleRepository, CollectionAbleService],
  controllers: [CollectionAbleController],
})
export class CollectionAbleModule {}
