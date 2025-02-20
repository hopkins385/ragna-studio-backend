import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { TokenUsageService } from './token-usage.service';

@Controller('token-usage')
export class TokenUsageController {
  private readonly logger = new Logger(TokenUsageController.name);

  constructor(private tokenUsageService: TokenUsageService) {}

  @Get('history')
  async getTokenUsageHistory(@ReqUser() user: UserEntity) {
    try {
      const tokenUsages = await this.tokenUsageService.getTokenUsageHistory({
        userId: user.id,
        from: {
          year: '2025',
          month: '2',
        },
        to: {
          year: '2025',
          month: '2',
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
