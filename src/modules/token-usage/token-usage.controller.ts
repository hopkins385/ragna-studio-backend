import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Controller, Get, InternalServerErrorException, Logger, Query } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { TokenUsageHistoryQuery } from './dto/token-usage-history.query.dto';
import { TokenUsageService } from './token-usage.service';

@Controller('token-usage')
export class TokenUsageController {
  private readonly logger = new Logger(TokenUsageController.name);

  constructor(private tokenUsageService: TokenUsageService) {}

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
      this.logger.error(`Error getting token usage history`, error);
      throw new InternalServerErrorException();
    }
  }
}
