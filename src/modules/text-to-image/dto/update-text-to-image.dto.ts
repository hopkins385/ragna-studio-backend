import { PartialType } from '@nestjs/swagger';
import { CreateTextToImageDto } from './create-text-to-image.dto';

export class UpdateTextToImageDto extends PartialType(CreateTextToImageDto) {}
