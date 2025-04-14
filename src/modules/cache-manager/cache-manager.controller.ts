import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Inject } from '@nestjs/common';

@Controller('cache-manager')
export class CacheManagerController {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /*@Post('purge')
  async purgeCache(
    @Body() body: { token: string },
  ): Promise<{ message: string }> {
    if (body.token !== 'super-secret-token') {
      throw new UnauthorizedException('Invalid token');
    }
    try {
      await this.cacheManager.clear();
      return { message: 'Cache successfully purged.' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to purge cache');
    }
  }*/
}
