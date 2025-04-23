import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatesNewUserAction } from '../user/actions/createsNewUserAction';
import { SessionService } from './../session/session.service';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { OnboardingEvent } from './enums/onboarding-event.enum';
import { OnboardingCompletedDto } from './events/onboarding.event';
import { OnboardRepository } from './repositories/onboard.repository';

@Injectable()
export class OnboardService {
  private readonly logger = new Logger(OnboardService.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly onboardRepo: OnboardRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onboardUser({ userId, userName, userEmail, orgName, sessionId }: OnboardUserDto) {
    const action = new CreatesNewUserAction(this.onboardRepo.prisma);
    try {
      // Run the pipeline
      await action.runPipeline({
        userId,
        userName,
        orgName,
      });

      // refresh session by userId
      await this.sessionService.refreshSessionByUserId({ sessionId, userId });

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
