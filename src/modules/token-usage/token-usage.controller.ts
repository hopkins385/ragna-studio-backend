import { BaseController } from '@/common/controllers/base.controller';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Controller, Get, Query } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { TokenUsageHistoryQuery } from './dto/token-usage-history.query.dto';
import { TokenUsageService } from './token-usage.service';

@Controller('token-usage')
export class TokenUsageController extends BaseController {
  constructor(private tokenUsageService: TokenUsageService) {
    super();
  }

  @Get('history')
  async getTokenUsageHistory(
    @ReqUser() reqUser: RequestUser,
    @Query() query: TokenUsageHistoryQuery,
  ) {
    const { year, month } = query;
    try {
      const tokenUsages = await this.tokenUsageService.getTokenUsageHistory({
        userId: reqUser.id,
        from: {
          year,
          month,
        },
        to: {
          year,
          month,
        },
      });

      return { tokenUsages };
      //
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
