import { isCUID2, randomCUID2 } from '@/common/utils/random-cuid2';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

export interface SessionPayload {
  [key: string]: any;
}

type SessionId = string;

const SESSION_PREFIX = 'session:';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

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
    await this.cacheManager.set(
      SESSION_PREFIX + sessionId,
      payload,
      SESSION_TTL_MS,
    );

    return sessionId;
  }

  async getSession(sessionId: SessionId): Promise<SessionPayload | null> {
    if (!isCUID2(sessionId)) {
      return null;
    }
    const sessionData = await this.cacheManager.get(SESSION_PREFIX + sessionId);
    return sessionData;
  }

  async updateSession(
    sessionId: SessionId,
    payload: SessionPayload,
  ): Promise<SessionId | null> {
    if (!sessionId || !payload || !isCUID2(sessionId)) {
      return null;
    }
    const sessionData = await this.cacheManager.get(SESSION_PREFIX + sessionId);
    if (!sessionData) {
      return null;
    }

    await this.cacheManager.set(SESSION_PREFIX + sessionId, payload);
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
