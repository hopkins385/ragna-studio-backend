// credit.controller.ts
import { BaseController } from '@/common/controllers/base.controller';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { CreditService } from './credit.service';

@Controller('credits')
export class CreditController extends BaseController {
  constructor(private creditService: CreditService) {
    super();
  }

  @Get()
  async getUserCredits(@ReqUser() reqUser: RequestUser) {
    try {
      return await this.creditService.getUserCredits({ userId: reqUser.id });
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Post('use')
  async useCredits(@ReqUser() reqUser: RequestUser, @Body() body: { amount: number }) {
    try {
      await this.creditService.useCredits({
        userId: reqUser.id,
        amount: body.amount,
      });
      return { message: 'Credits used successfully' };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Post('purchase')
  async purchaseCredits(
    @ReqUser() reqUser: RequestUser,
    @Body() body: { amount: number; cost: number },
  ) {
    try {
      await this.creditService.purchaseCredits({
        userId: reqUser.id,
        amount: body.amount,
        cost: body.cost,
      });
      return { message: 'Credits purchased successfully' };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get('history')
  async getCreditUsageHistory(@ReqUser() reqUser: RequestUser) {
    try {
      return await this.creditService.getCreditUsageHistory({ userId: reqUser.id });
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
