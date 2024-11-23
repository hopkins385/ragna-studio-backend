import { Injectable, Logger } from '@nestjs/common';
import { CreateOnboardDto } from './dto/create-onboard.dto';
import { UpdateOnboardDto } from './dto/update-onboard.dto';
import { OnboardRepository } from './repositories/onboard.repository';
import { CreatesNewUserAction } from './actions/createsNewUserAction';
import { OnboardUserDto } from './dto/onboard-user.dto';

const logger = new Logger('OnboardService');

@Injectable()
export class OnboardService {
  constructor(private readonly onboardRepo: OnboardRepository) {}

  async onboardUser({ userId, userName, orgName }: OnboardUserDto) {
    const action = new CreatesNewUserAction(this.onboardRepo.prisma);
    try {
      await action.runPipeline({
        userId,
        userName,
        orgName,
      });
      return true;
    } catch (error) {
      Logger.error(error);
      throw new Error('Failed to onboard user');
    }
  }
}
