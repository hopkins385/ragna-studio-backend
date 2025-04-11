import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { UserService } from '@/modules/user/user.service';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { OnboardUserBody } from './dto/onboard-user-body.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { OnboardService } from './onboard.service';

@Controller('onboard')
export class OnboardController {
  constructor(
    private readonly onboardService: OnboardService,
    private readonly userService: UserService,
  ) {}

  @Post('user')
  async onboardUser(@ReqUser() reqUser: RequestUser, @Body() body: OnboardUserBody) {
    if (reqUser.onboardedAt !== null) {
      throw new BadRequestException('User already onboarded');
    }

    const user = await this.userService.findOne({ userId: reqUser.id });
    const payload = OnboardUserDto.fromInput({
      userId: reqUser.id,
      userName: user.name,
      userEmail: user.email,
      orgName: body.orgName,
    });

    try {
      const result = await this.onboardService.onboardUser(payload);
      return { success: result };
    } catch (error: any) {
      throw new InternalServerErrorException('Error onboarding user');
    }
  }
}
