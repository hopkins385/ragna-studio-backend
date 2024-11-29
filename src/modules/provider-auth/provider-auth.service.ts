import { Injectable } from '@nestjs/common';
import { ProviderAuthRepository } from './repositories/provider-auth.repository';
import { ProviderAuthDto } from './dto/provider-auth.dto';
import {
  ProviderAuthName,
  ProviderAuthType,
} from './interfaces/provider-auth.interface';

@Injectable()
export class ProviderAuthService {
  constructor(private readonly providerAuthRepo: ProviderAuthRepository) {}

  async findFirst(payload: {
    userId: string;
    providerName: ProviderAuthName;
    type: ProviderAuthType;
  }) {
    return this.providerAuthRepo.prisma.providerAuth.findFirst({
      where: {
        userId: payload.userId.toLowerCase().trim(),
        providerName: payload.providerName.toLowerCase().trim(),
        type: payload.type.toLowerCase().trim(),
      },
    });
  }

  async create(payload: ProviderAuthDto) {
    return this.providerAuthRepo.prisma.providerAuth.create({
      data: {
        providerName: payload.providerName,
        type: payload.type,
        accountInfo: payload.accountInfo,
        userId: payload.userId,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt,
        refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async upsert(payload: ProviderAuthDto) {
    const findProviderAuth = await this.findFirst({
      userId: payload.userId,
      providerName: payload.providerName,
      type: payload.type,
    });

    if (!findProviderAuth) {
      return await this.create(payload);
    }

    return await this.providerAuthRepo.prisma.providerAuth.update({
      where: {
        id: findProviderAuth.id,
      },
      data: {
        providerName: payload.providerName,
        type: payload.type,
        accountInfo: payload.accountInfo,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt,
        refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async update(payload: ProviderAuthDto) {
    const findProviderAuth = await this.findFirst({
      userId: payload.userId,
      providerName: payload.providerName,
      type: payload.type,
    });

    if (!findProviderAuth) {
      return await this.create(payload);
    }

    return await this.providerAuthRepo.prisma.providerAuth.update({
      where: {
        id: findProviderAuth.id,
        userId: payload.userId,
      },
      data: {
        providerName: payload.providerName,
        type: payload.type,
        accountInfo: payload.accountInfo,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt,
        refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    const providerAuth = await this.providerAuthRepo.prisma.providerAuth.delete(
      {
        where: { id },
      },
    );
    return providerAuth;
  }
}
