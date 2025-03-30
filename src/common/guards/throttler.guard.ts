import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    console.log('ips', req.ips);
    console.log('ip', req.ip);
    console.log('x-forwarded-for', req.headers['x-forwarded-for']);
    const userIp = req.headers['x-forwarded-for'] || req.ips.length ? req.ips[0] : req.ip;
    console.log('userIp', userIp);
    return userIp; // individualize IP extraction to meet your own needs
  }
}
