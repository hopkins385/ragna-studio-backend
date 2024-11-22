import { createZodDto } from 'nestjs-zod';
import { socialAuthProviderSchema } from './social-auth-provider.schema';
import { z } from 'zod';

export class SocialAuthProviderParam extends createZodDto(
  z.object({
    provider: socialAuthProviderSchema,
  }),
) {}
