import { createZodDto } from 'nestjs-zod';
import { FluxProInputsSchema } from '../schemas/flux-pro.schema';

export class FluxProBody extends createZodDto(FluxProInputsSchema) {}
