import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { TokenUsageService } from './token-usage.service';
import { TokenUsageHistoryQuery } from './dto/token-usage-history.query.dto';

@Controller('token-usage')
export class TokenUsageController {
  private readonly logger = new Logger(TokenUsageController.name);

  constructor(private tokenUsageService: TokenUsageService) {}

  @Get('history')
  async getTokenUsageHistory(
    @ReqUser() user: UserEntity,
    @Query() query: TokenUsageHistoryQuery,
  ) {
    const { year, month } = query;
    try {
      const tokenUsages = await this.tokenUsageService.getTokenUsageHistory({
        userId: user.id,
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
