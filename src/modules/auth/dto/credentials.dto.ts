import { createZodDto } from 'nestjs-zod';
import { credentialsSchema } from '@/modules/auth/schemas/credentials.schema';

export class CredentialsDto extends createZodDto(credentialsSchema) {}
