import { BaseController } from '@/common/controllers/base.controller';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { UserService } from '@/modules/user/user.service';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { OnboardUserBody } from './dto/onboard-user-body.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { OnboardService } from './onboard.service';

@Controller('onboard')
export class OnboardController extends BaseController {
  constructor(
    private readonly onboardService: OnboardService,
    private readonly userService: UserService,
  ) {
    super();
  }

  @Post('user')
  async onboardUser(@ReqUser() reqUser: RequestUser, @Body() body: OnboardUserBody) {
    if (reqUser.onboardedAt !== null) {
      throw new BadRequestException('already onboarded');
    }

    try {
      const user = await this.userService.findOne({ userId: reqUser.id });
      const result = await this.onboardService.onboardUser(
        OnboardUserDto.fromInput({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          orgName: body.orgName,
          sessionId: reqUser.sessionId,
        }),
      );
      return { success: result };
    } catch (error: any) {
      this.handleError(error);
    }
  }
}
