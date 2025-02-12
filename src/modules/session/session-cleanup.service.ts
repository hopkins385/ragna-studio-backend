// session-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionService } from './session.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private sessionService: SessionService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSessionCleanup() {
    this.logger.log('Starting session cleanup');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Example: Remove sessions older than 30 days

    try {
      const result = await this.sessionService.cleanupOldDBSessions({
        cutoffDate,
      });
      this.logger.log(`Cleaned up ${result.count} old sessions`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Error during session cleanup', error.stack);
      } else {
        this.logger.error('Error during session cleanup');
      }
    }
  }
}
