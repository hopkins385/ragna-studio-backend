import { PartialType } from '@nestjs/swagger';
import { CreateOnboardDto } from './create-onboard.dto';

export class UpdateOnboardDto extends PartialType(CreateOnboardDto) {}
