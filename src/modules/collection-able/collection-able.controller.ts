import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CollectionAbleService } from './collection-able.service';
import { AttachCollectionAbleDto } from './dto/attach-collection-able.dto';
import { DetachCollectionAbleDto } from './dto/detach-collection-able.dto';
import { DetachAllCollectionAbleDto } from './dto/detach-all-collection-able.dto';
import { CollectionAbleBody } from './dto/collection-able-body.dto';
import { DetachCollectionAbleBody } from './dto/detach-collection-able-body.dto';

@Controller('collection-able')
export class CollectionAbleController {
  constructor(private readonly collectionAbleService: CollectionAbleService) {}

  @Post('attach')
  async attachTo(@Body() body: CollectionAbleBody) {
    const payload = AttachCollectionAbleDto.fromInput({
      model: {
        id: body.model.id,
        type: body.model.type,
      },
      collectionId: body.collectionId,
    });
    try {
      const result = await this.collectionAbleService.attachTo(payload);
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException('Error attaching to collection');
    }
  }

  @Post('detach')
  @HttpCode(200)
  async detachFrom(@Body() body: CollectionAbleBody) {
    const payload = DetachCollectionAbleDto.fromInput({
      model: {
        id: body.model.id,
        type: body.model.type,
      },
      collectionId: body.collectionId,
    });

    try {
      const result = await this.collectionAbleService.detachFrom(payload);
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException('Error detaching from collection');
    }
  }

  @Post('detach-all')
  @HttpCode(200)
  async detachAllFrom(@Body() body: DetachCollectionAbleBody) {
    const payload = DetachAllCollectionAbleDto.fromInput({
      model: {
        id: body.model.id,
        type: body.model.type,
      },
    });
    try {
      const result = await this.collectionAbleService.detachAllFrom(payload);
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error detaching all from collection',
      );
    }
  }

  @Post('replace')
  @HttpCode(200)
  async replaceTo(@Body() body: CollectionAbleBody) {
    const payload = AttachCollectionAbleDto.fromInput({
      model: {
        id: body.model.id,
        type: body.model.type,
      },
      collectionId: body.collectionId,
    });
    try {
      const result = await this.collectionAbleService.replaceTo(payload);
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException('Error replacing to collection');
    }
  }
}
