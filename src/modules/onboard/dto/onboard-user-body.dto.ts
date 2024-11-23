import { createZodDto } from 'nestjs-zod';
import { onboardUserSchema } from '../schemas/onboard-user.schema';

export class OnboardUserBody extends createZodDto(onboardUserSchema) {}
