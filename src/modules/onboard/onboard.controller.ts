import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OnboardService } from './onboard.service';
import { OnboardUserBody } from './dto/onboard-user-body.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('onboard')
export class OnboardController {
  constructor(private readonly onboardService: OnboardService) {}

  @Post('user')
  async onboardUser(
    @ReqUser() user: UserEntity,
    @Body() body: OnboardUserBody,
  ) {
    if (user.onboardedAt !== null) {
      throw new BadRequestException('User already onboarded');
    }
    const payload = OnboardUserDto.fromInput({
      userId: user.id,
      userName: user.name ?? 'User Name',
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
