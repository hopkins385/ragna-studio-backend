import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userIp = req.headers['x-forwarded-for'] || req.ips.length ? req.ips[0] : req.ip;
    console.log('userIp', userIp);
    return userIp; // individualize IP extraction to meet your own needs
  }
}
