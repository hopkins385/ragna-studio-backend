import { isCUID2, randomCUID2 } from '@/common/utils/random-cuid2';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

type SessionId = string;
type UserId = string;

export interface SessionUser {
  id: SessionId;
  user: {
    id: UserId;
  };
}

export interface SessionPayload {
  user: SessionUser['user'];
}

const SESSION_PREFIX = 'session:';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 1; // 1 days

@Injectable()
export class SessionService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async createSession({
    payload,
  }: {
    payload: SessionPayload;
  }): Promise<SessionId> {
    // create a new session id
    const sessionId = randomCUID2();
    const sessionData = {
      id: sessionId,
      user: {
        id: payload.user.id,
      },
    };

    await this.cacheManager.set(
      SESSION_PREFIX + sessionId,
      sessionData,
      SESSION_TTL_MS,
    );

    return sessionId;
  }

  async getSession(sessionId: SessionId): Promise<SessionUser | null> {
    if (!isCUID2(sessionId)) {
      return null;
    }

    const sessionData = await this.cacheManager.get<SessionUser>(
      SESSION_PREFIX + sessionId,
    );

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
    payload: SessionPayload,
  ): Promise<SessionId | null> {
    if (!sessionId || !payload || !isCUID2(sessionId)) {
      return null;
    }
    const oldSessionData = await this.cacheManager.get<SessionUser>(
      SESSION_PREFIX + sessionId,
    );
    if (!oldSessionData) {
      return null;
    }

    const sessionData = {
      user: {
        id: payload.user.id,
      },
    };

    await this.cacheManager.set(
      SESSION_PREFIX + sessionId,
      sessionData,
      SESSION_TTL_MS,
    );
    return sessionId;
  }

  async deleteSession(sessionId: SessionId): Promise<boolean> {
    if (!isCUID2(sessionId)) {
      return false;
    }
    await this.cacheManager.del(SESSION_PREFIX + sessionId);
    return true;
  }
}
