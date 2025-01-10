import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HTTP_CLIENT, HTTP_CONFIG } from './constants';

export interface HttpConfig {
  timeout?: number;
  retries?: number;
}

@Global()
@Module({
  providers: [
    {
      provide: HTTP_CONFIG,
      useFactory: (configService: ConfigService): HttpConfig => ({
        timeout: configService.get('HTTP_CLIENT_TIMEOUT', 15000),
        retries: configService.get('HTTP_CLIENT_RETRIES', 3),
      }),
      inject: [ConfigService],
    },
    {
      provide: HTTP_CLIENT,
      useFactory: (config: HttpConfig) => {
        const axiosInstance = axios.create({
          timeout: config.timeout,
        });
        return axiosInstance;
      },
      inject: [HTTP_CONFIG],
    },
  ],
  exports: [HTTP_CLIENT],
})
export class HttpClientModule {}
