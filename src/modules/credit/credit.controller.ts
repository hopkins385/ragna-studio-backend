// credit.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreditService } from './credit.service';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('credits')
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get()
  async getUserCredits(@ReqUser() user: UserEntity) {
    return this.creditService.getUserCredits({ userId: user.id });
  }

  @Post('use')
  async useCredits(
    @ReqUser() user: UserEntity,
    @Body() body: { amount: number },
  ) {
    await this.creditService.useCredits({
      userId: user.id,
      amount: body.amount,
    });
    return { message: 'Credits used successfully' };
  }

  @Post('purchase')
  async purchaseCredits(
    @ReqUser() user: UserEntity,
    @Body() body: { amount: number; cost: number },
  ) {
    await this.creditService.purchaseCredits({
      userId: user.id,
      amount: body.amount,
      cost: body.cost,
    });
    return { message: 'Credits purchased successfully' };
  }

  @Get('history')
  async getCreditUsageHistory(@ReqUser() user: UserEntity) {
    return this.creditService.getCreditUsageHistory({ userId: user.id });
  }
}
