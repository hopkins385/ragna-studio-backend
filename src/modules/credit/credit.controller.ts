// credit.controller.ts
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { CreditService } from './credit.service';

@Controller('credits')
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get()
  async getUserCredits(@ReqUser() reqUser: RequestUser) {
    return this.creditService.getUserCredits({ userId: reqUser.id });
  }

  @Post('use')
  async useCredits(@ReqUser() reqUser: RequestUser, @Body() body: { amount: number }) {
    await this.creditService.useCredits({
      userId: reqUser.id,
      amount: body.amount,
    });
    return { message: 'Credits used successfully' };
  }

  @Post('purchase')
  async purchaseCredits(
    @ReqUser() reqUser: RequestUser,
    @Body() body: { amount: number; cost: number },
  ) {
    await this.creditService.purchaseCredits({
      userId: reqUser.id,
      amount: body.amount,
      cost: body.cost,
    });
    return { message: 'Credits purchased successfully' };
  }

  @Get('history')
  async getCreditUsageHistory(@ReqUser() reqUser: RequestUser) {
    return this.creditService.getCreditUsageHistory({ userId: reqUser.id });
  }
}
