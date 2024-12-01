import { createZodDto } from 'nestjs-zod';
import { googleDriveCodeSchema } from '../schemas/google-drive-code.schema';

export class GoogleDriveCodeQuery extends createZodDto(googleDriveCodeSchema) {}
