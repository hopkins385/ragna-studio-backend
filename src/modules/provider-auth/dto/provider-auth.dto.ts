import {
  ProviderAuthName,
  ProviderAuthType,
} from '../interfaces/provider-auth.interface';

export class ProviderAuthDto {
  readonly providerName: ProviderAuthName;
  readonly type: ProviderAuthType;
  readonly accountInfo: any | undefined;
  readonly userId: string;
  readonly accessToken: string;
  readonly refreshToken: string | undefined;
  readonly accessTokenExpiresAt: Date | undefined;
  readonly refreshTokenExpiresAt: Date | undefined;

  constructor(
    providerName: ProviderAuthName,
    type: ProviderAuthType,
    accountInfo: any | undefined,
    userId: string,
    accessToken: string,
    refreshToken: string | undefined,
    accessTokenExpiresAt: Date | undefined,
    refreshTokenExpiresAt: Date | undefined,
  ) {
    this.providerName = providerName;
    this.type = type;
    this.accountInfo = accountInfo;
    this.userId = userId.toLowerCase();
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.accessTokenExpiresAt = accessTokenExpiresAt;
    this.refreshTokenExpiresAt = refreshTokenExpiresAt;
  }

  static fromInput(input: {
    providerName: ProviderAuthName;
    type: ProviderAuthType;
    accountInfo?: any;
    userId: string;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
  }): ProviderAuthDto {
    return new ProviderAuthDto(
      input.providerName,
      input.type,
      input.accountInfo,
      input.userId,
      input.accessToken,
      input.refreshToken,
      input.accessTokenExpiresAt,
      input.refreshTokenExpiresAt,
    );
  }
}
