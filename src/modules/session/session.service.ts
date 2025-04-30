import { isCUID2, randomCUID2 } from '@/common/utils/random-cuid2';
import { SessionUserEntity } from '@/modules/session/entities/session-user.entity';
import { UserService } from '@/modules/user/user.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { DeviceInfo } from './entities/device-info.entity';
import { SessionRepository } from './repositories/session.repository';

type SessionId = string;

interface DecryptedSessionAuthData {
  refreshToken: string;
  lastLoginIp: string;
}
type EncryptedSessionAuthData = string;

export interface FullSessionData {
  id: SessionId;
  user: SessionUserEntity;
  // auth: EncryptedSessionAuthData;
}

export type SessionData = Omit<FullSessionData, 'auth'>;

export interface CreateSessionPayload {
  user: SessionUserEntity;
  // auth: EncryptedSessionAuthData;
}

const SESSION_PREFIX = 'session:';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly SESSION_TTL_MS: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly sessionRepo: SessionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const sessionExpiresIn = this.configService.get<StringValue>('SESSION_EXPIRES_IN', '30m');
    this.SESSION_TTL_MS = ms(sessionExpiresIn);
  }

  async createSession({ payload }: { payload: CreateSessionPayload }): Promise<SessionData> {
    // create a new session id
    const sessionId = randomCUID2();
    // SessionData
    const sessionData: FullSessionData = {
      id: sessionId,
      user: payload.user,
      // auth: encryptedSessionAuthData,
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

  /**
   * Retrieves the session user data from the database using the userId.
   * @param payload.userId - The user ID to retrieve the session data for.
   * @throws UnauthorizedException if the user ID is invalid or the user is not found.
   * @returns
   */
  async getSessionUserData({ userId }: { userId: string }): Promise<SessionUserEntity> {
    try {
      const fullUser = await this.userService.findOne({ userId });

      const sessionUser = new SessionUserEntity({
        id: fullUser.id,
        organisationId: fullUser.organisationId,
        activeTeamId: fullUser.teams?.[0]?.team.id || null,
        onboardedAt: fullUser.onboardedAt,
        roles: fullUser.roles,
        teams: fullUser.teams.map((t) => t.team.id),
      });

      return sessionUser;
    } catch (error: unknown) {
      const errStack = error instanceof Error ? error?.stack : undefined;
      this.logger.error('Error retrieving session user data', errStack);
      throw new UnauthorizedException('Failed to retrieve session user data');
    }
  }

  async createSessionByUserId({ userId }: { userId: string }): Promise<SessionData> {
    if (!isCUID2(userId)) {
      throw new UnauthorizedException('Invalid user id');
    }

    const sessionUserData = await this.getSessionUserData({ userId });

    const sessionData = await this.createSession({
      payload: {
        user: sessionUserData,
        // auth: await hashObject({
        //   refreshToken: randomCUID2(),
        //   lastLoginIp: 'Unknown',
        // }),
      },
    });

    this.logger.debug(`Created session: sessionId: ${sessionData.id}`);
    this.logger.debug(`SessionData: ${JSON.stringify(sessionData)}`);

    return sessionData;
  }

  /**
   * Retrieves the session data from the cache using the sessionId.
   * @param payload.sessionId - The session ID to retrieve.
   * @param options.extend - (optional) If true, the session expiration time will be reset which will extend the session.
   * @throws UnauthorizedException if the session ID is invalid or the session is not found.
   * @returns
   */
  async getSession(
    { sessionId }: { sessionId: SessionId },
    options?: { extend: boolean },
  ): Promise<SessionData> {
    if (!isCUID2(sessionId)) {
      throw new UnauthorizedException('Invalid session id');
    }

    const sessionData = await this.cacheManager.get<SessionData>(SESSION_PREFIX + sessionId);

    if (!sessionData || !sessionData.user) {
      throw new UnauthorizedException('Session not found');
    }

    if (options?.extend) {
      await this.extendSession({
        sessionId,
        sessionData,
      });
    }

    return {
      id: sessionId,
      user: sessionData.user,
    };
  }

  /**
   * Extends the session by updating the session data in the cache and database if sessionData is provided.
   * If sessionData is not provided, it retrieves the session data from the cache and updates the expiration time.
   * @param payload.sessionId - The session ID to extend.
   * @param payload.sessionData - (optional) The session data to update. If not provided, the existing session data will be used.
   * @returns
   */
  async extendSession({
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

  async refreshSessionByUserId({ userId, sessionId }: { userId: string; sessionId: SessionId }) {
    if (!isCUID2(sessionId)) {
      throw new UnauthorizedException('Invalid session id');
    }

    const sessionUserData = await this.getSessionUserData({ userId });

    return this.extendSession({
      sessionId,
      sessionData: {
        id: sessionId,
        user: sessionUserData,
      },
    });
  }

  async deleteSession({ sessionId }: { sessionId: SessionId }): Promise<boolean> {
    if (!isCUID2(sessionId)) {
      throw new UnauthorizedException('Invalid session id');
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
