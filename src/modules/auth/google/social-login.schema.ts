import { socialAuthProviderSchema } from './social-auth-provider.schema';
import { z } from 'zod';

export const socialLoginSchema = z.object({
  provider: socialAuthProviderSchema,
  deviceId: z.string(),
  idToken: z.string(),
  username: z.string().optional(),
});
