import { Injectable, Logger } from '@nestjs/common';
import { CreateOnboardDto } from './dto/create-onboard.dto';
import { UpdateOnboardDto } from './dto/update-onboard.dto';
import { OnboardRepository } from './repositories/onboard.repository';
import { CreatesNewUserAction } from './actions/createsNewUserAction';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnboardingCompletedDto } from './events/onboarding.event';
import { OnboardingEvent } from './enums/onboarding-event.enum';

@Injectable()
export class OnboardService {
  private readonly logger = new Logger(OnboardService.name);

  constructor(
    private readonly onboardRepo: OnboardRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onboardUser({ userId, userName, userEmail, orgName }: OnboardUserDto) {
    const action = new CreatesNewUserAction(this.onboardRepo.prisma);
    try {
      // Run the pipeline
      await action.runPipeline({
        userId,
        userName,
        orgName,
      });

      // Emit the completed event
      this.eventEmitter.emit(
        OnboardingEvent.COMPLETED,
        OnboardingCompletedDto.fromInput({
          userId,
          payload: {
            userName,
            userEmail,
            orgName,
          },
        }),
      );

      return true;
      //
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Failed to onboard user');
    }
  }
}
