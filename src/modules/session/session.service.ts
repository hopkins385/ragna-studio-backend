import { isCUID2, randomCUID2 } from '@/common/utils/random-cuid2';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { SessionRepository } from './repositories/session.repository';
import { DeviceInfo } from './entities/device-info.entity';
import { SessionUserEntity } from '@/modules/session/entities/session-user.entity';

type SessionId = string;

export interface SessionData {
  id: SessionId;
  user: SessionUserEntity;
}

export interface CreateSessionPayload {
  user: SessionUserEntity;
}

const SESSION_PREFIX = 'session:';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 1; // 1 days

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

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

    await this.cacheManager.set(SESSION_PREFIX + sessionId, sessionData, SESSION_TTL_MS);

    const expires = new Date();
    expires.setTime(expires.getTime() + SESSION_TTL_MS);

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

  async getSession({ sessionId }: { sessionId: SessionId }): Promise<SessionData | null> {
    if (!isCUID2(sessionId)) {
      return null;
    }

    const sessionData = await this.cacheManager.get<SessionData>(SESSION_PREFIX + sessionId);

    if (!sessionData || !sessionData.user) {
      return null;
    }

    return {
      id: sessionId,
      user: sessionData.user,
    };
  }

  async refreshSession(
    sessionId: SessionId,
    payload: CreateSessionPayload,
  ): Promise<SessionId | null> {
    if (!sessionId || !payload || !isCUID2(sessionId)) {
      return null;
    }
    const oldSessionData = await this.cacheManager.get<SessionData>(SESSION_PREFIX + sessionId);
    if (!oldSessionData) {
      return null;
    }

    const sessionData = {
      user: {
        id: payload.user.id,
      },
    };

    await this.cacheManager.set(SESSION_PREFIX + sessionId, sessionData, SESSION_TTL_MS);

    const expires = new Date();
    expires.setTime(expires.getTime() + SESSION_TTL_MS);

    await this.updateLastAccessed({
      sessionId,
      expires,
    });

    return sessionId;
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
