// credit.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreditService } from './credit.service';

@Controller('credits')
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get(':userId')
  async getUserCredits(@Param('userId') userId: string) {
    return this.creditService.getUserCredits(userId);
  }

  @Post(':userId/use')
  async useCredits(
    @Param('userId') userId: string,
    @Body() body: { amount: number; action: string },
  ) {
    await this.creditService.useCredits(userId, body.amount, body.action);
    return { message: 'Credits used successfully' };
  }

  @Post(':userId/purchase')
  async purchaseCredits(
    @Param('userId') userId: string,
    @Body() body: { amount: number; cost: number },
  ) {
    await this.creditService.purchaseCredits(userId, body.amount, body.cost);
    return { message: 'Credits purchased successfully' };
  }

  @Get(':userId/history')
  async getCreditUsageHistory(@Param('userId') userId: string) {
    return this.creditService.getCreditUsageHistory(userId);
  }
}
