import { OnboardRepository } from './repositories/onboard.repository';
import { Module } from '@nestjs/common';
import { OnboardService } from './onboard.service';
import { OnboardController } from './onboard.controller';

@Module({
  controllers: [OnboardController],
  providers: [OnboardRepository, OnboardService],
})
export class OnboardModule {}
