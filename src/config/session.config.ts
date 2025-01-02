// import RedisStore from 'connect-redis';
import Redis from 'ioredis';
// import { SessionOptions } from 'express-session';

export function getSessionConfig(isDev: boolean): any {
  // type: SessionOptions
  if (
    !process.env.APP_SECRET ||
    !process.env.REDIS_PASSWORD ||
    !process.env.REDIS_HOST ||
    !process.env.REDIS_PORT
  ) {
    throw new Error('ENVs for session config not set');
  }

  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

  // Initialize store.
  // const redisStore = new RedisStore({
  //   client: redisClient,
  //   prefix: 'session:',
  // });

  const sessionConfig: any = {
    // store: redisStore,
    name: isDev ? 'session-token' : '__Secure-auth.session-token',
    secret: process.env.APP_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !isDev,
      sameSite: 'lax',
      // expires: new Date(Date.now() + 1000 * 60 * 2), // 20 minutes
    },
  };

  return sessionConfig;
}
