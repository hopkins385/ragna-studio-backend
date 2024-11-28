import { ProviderAuthRepository } from './repositories/provider-auth.repository';
import { Module } from '@nestjs/common';
import { ProviderAuthService } from './provider-auth.service';

@Module({
  providers: [ProviderAuthRepository, ProviderAuthService],
  exports: [ProviderAuthService],
})
export class ProviderAuthModule {}
