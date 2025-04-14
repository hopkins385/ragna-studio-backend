import { isCUID2, randomCUID2 } from '@/common/utils/random-cuid2';
import { SessionUserEntity } from '@/modules/session/entities/session-user.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { DeviceInfo } from './entities/device-info.entity';
import { SessionRepository } from './repositories/session.repository';

type SessionId = string;

export interface SessionData {
  id: SessionId;
  user: SessionUserEntity;
}

export interface CreateSessionPayload {
  user: SessionUserEntity;
}

const SESSION_PREFIX = 'session:';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly SESSION_TTL_MS: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionRepo: SessionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const sessionExpiresIn = this.configService.get<StringValue>('SESSION_EXPIRES_IN', '30m');
    this.SESSION_TTL_MS = ms(sessionExpiresIn);
  }

  async createSession({ payload }: { payload: CreateSessionPayload }): Promise<SessionData> {
    // create a new session id
    const sessionId = randomCUID2();
    const sessionData: SessionData = {
      id: sessionId,
      user: payload.user,
    };

    const deviceInfo: DeviceInfo = {
      os: 'Unknown',
      browser: 'Unknown',
      device: 'Unknown',
      location: 'Unknown',
    };

    await this.cacheManager.set(SESSION_PREFIX + sessionId, sessionData, this.SESSION_TTL_MS);

    const expires = new Date();
    expires.setTime(expires.getTime() + this.SESSION_TTL_MS);

    await this.createDBSession({
      sessionId,
      userId: payload.user.id,
      // @ts-ignore
      deviceInfo,
      ipAddress: 'Unknown',
      expires,
    });

    return sessionData;
  }

  async getSession(
    { sessionId }: { sessionId: SessionId },
    options?: { refresh: boolean },
  ): Promise<SessionData | null> {
    if (!isCUID2(sessionId)) {
      return null;
    }

    const sessionData = await this.cacheManager.get<SessionData>(SESSION_PREFIX + sessionId);

    if (!sessionData || !sessionData.user) {
      return null;
    }

    if (options?.refresh) {
      await this.refreshSession({
        sessionId,
        sessionData,
      });
    }

    return {
      id: sessionId,
      user: sessionData.user,
    };
  }

  async refreshSession({
    sessionId,
    sessionData,
  }: {
    sessionId: SessionId;
    sessionData?: any;
  }): Promise<SessionId | null> {
    if (!sessionId || !isCUID2(sessionId)) {
      return null;
    }
    if (!sessionData) {
      const oldSessionData = await this.cacheManager.get<SessionData>(SESSION_PREFIX + sessionId);
      if (!oldSessionData) {
        return null;
      }
      sessionData = oldSessionData;
    }

    await this.cacheManager.set(SESSION_PREFIX + sessionId, sessionData, this.SESSION_TTL_MS);

    const expires = new Date();
    expires.setTime(expires.getTime() + this.SESSION_TTL_MS);

    await this.updateLastAccessed({
      sessionId,
      expires,
    });

    return sessionData;
  }

  async deleteSession(sessionId: SessionId): Promise<boolean> {
    if (!isCUID2(sessionId)) {
      return false;
    }
    await this.deleteDBSession({ sessionId });
    await this.cacheManager.del(SESSION_PREFIX + sessionId);
    return true;
  }

  async createDBSession(payload: {
    sessionId: string;
    userId: string;
    deviceInfo: string;
    ipAddress: string;
    expires: Date;
    refreshToken?: string;
  }) {
    return this.sessionRepo.prisma.session.create({
      data: {
        sessionId: payload.sessionId,
        userId: payload.userId,
        deviceInfo: payload.deviceInfo,
        ipAddress: payload.ipAddress,
        expires: payload.expires,
        sessionToken: payload.refreshToken,
      },
    });
  }

  async getAllUserDBSessions({ userId }: { userId: string }) {
    return this.sessionRepo.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteDBSession({ sessionId }: { sessionId: string }) {
    // abort if the session id is not in the database
    const session = await this.sessionRepo.prisma.session.findUnique({
      where: { sessionId },
    });

    if (!session) {
      return;
    }

    return this.sessionRepo.prisma.session.delete({
      where: { id: session.id },
    });
  }

  async updateLastAccessed(payload: { sessionId: string; expires: Date }) {
    return this.sessionRepo.prisma.session.update({
      where: { sessionId: payload.sessionId },
      data: {
        updatedAt: new Date(),
        expires: payload.expires,
      },
    });
  }

  async revokeDBSessionToken(payload: { sessionToken: string }) {
    return this.sessionRepo.prisma.session.update({
      where: { sessionToken: payload.sessionToken },
      data: { sessionToken: null },
    });
  }

  async cleanupOldDBSessions({ cutoffDate }: { cutoffDate: Date }) {
    return this.sessionRepo.prisma.session.deleteMany({
      where: {
        expires: {
          lte: cutoffDate,
        },
      },
    });
  }

  async cleanupOldDBSessionsInBatches(payload: { olderThan: Date; batchSize: number }) {
    throw new Error('Not implemented');
    let deletedCount = 0;
    let continueDeleting = true;

    while (continueDeleting) {
      const result = await this.sessionRepo.prisma.session.deleteMany({
        where: {
          expires: {
            lt: payload.olderThan,
          },
        },
        // take: payload.batchSize, // Not supported by Prisma
      });

      deletedCount += result.count;

      if (result.count < payload.batchSize) {
        continueDeleting = false;
      }

      // Optional: Add a small delay to reduce database load
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return deletedCount;
  }
}
