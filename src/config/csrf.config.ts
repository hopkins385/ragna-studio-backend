import { DoubleCsrfConfigOptions } from 'csrf-csrf';

export function getCsrfOptions(isDev: boolean): DoubleCsrfConfigOptions {
  if (!process.env.APP_SECRET) {
    throw new Error('ENV for csrf config not set');
  }

  const doubleCsrfOptions: DoubleCsrfConfigOptions = {
    getSecret: () => process.env.APP_SECRET || 'z0rhJYzBTMac',
    // getSessionIdentifier: (req) => req.sessionID || '',
    cookieName: isDev ? 'csrf-token' : '__Host-auth.csrf-token',
    cookieOptions: {
      secure: !isDev,
      sameSite: 'lax',
    },
  };

  return doubleCsrfOptions;
}
