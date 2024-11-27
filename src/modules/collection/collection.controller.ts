import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { CreateCollectionBody } from './dto/create-collection-body.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { UpdateCollectionBody } from './dto/update-collection-body.dto';
import { CollectionAbleDto } from '../collection-able/dto/collection-able.dto';
import { FindCollectionForBody } from './dto/find-collection-for-body.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  async create(
    @ReqUser() user: UserEntity,
    @Body() body: CreateCollectionBody,
  ) {
    const userTeamId = user.teams[0].team.id;

    try {
      const collection = await this.collectionService.createCollection(
        CreateCollectionDto.fromInput({
          teamId: userTeamId,
          name: body.name,
          description: body.description,
        }),
      );
      return { collection };
    } catch (error) {
      throw new NotFoundException('Collection not found');
    }
  }

  @Get()
  async findAllPaginated(
    @ReqUser() user: UserEntity,
    @Query() query: PaginateQuery,
  ) {
    const userTeamId = user.teams[0].team.id;
    try {
      const [collections, meta] = await this.collectionService.findAllPaginated(
        userTeamId,
        +query.page,
      );
      return { collections, meta };
    } catch (error) {
      throw new NotFoundException('Collections not found');
    }
  }

  @Get('all')
  async findAll(@ReqUser() user: UserEntity) {
    const userTeamId = user.teams[0].team.id;
    try {
      const collections = await this.collectionService.findAll(userTeamId);
      return { collections };
    } catch (error) {
      throw new NotFoundException('Collections not found');
    }
  }

  @Post('for')
  @HttpCode(HttpStatus.OK)
  async findAllFor(@Body() body: FindCollectionForBody) {
    const payload = CollectionAbleDto.fromInput({
      id: body.model.id,
      type: body.model.type,
    });

    try {
      const collections = await this.collectionService.findAllFor(payload);
      return { collections };
    } catch (error) {
      throw new NotFoundException('Collections not found');
    }
  }

  @Get(':id')
  async findOne(@ReqUser() user: UserEntity, @Param() param: IdParam) {
    const userTeamId = user.teams[0].team.id;
    const collectionId = param.id;

    try {
      const collection = await this.collectionService.findFirst(
        userTeamId,
        collectionId,
      );
      return { collection };
    } catch (error) {
      throw new NotFoundException('Collection not found');
    }
  }

  @Patch(':id')
  async update(
    @ReqUser() user: UserEntity,
    @Param() param: IdParam,
    @Body() body: UpdateCollectionBody,
  ) {
    const userTeamId = user.teams[0].team.id;
    const collectionId = param.id;

    const collection = await this.collectionService.findFirst(
      userTeamId,
      collectionId,
    );

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    try {
      const collectionUpdated = await this.collectionService.update(
        userTeamId,
        collectionId,
        CreateCollectionDto.fromInput({
          teamId: userTeamId,
          name: body.name,
          description: body.description,
        }),
      );
      return { collection: collectionUpdated };
    } catch (error) {
      throw new InternalServerErrorException('Error updating collection');
    }
  }

  @Delete(':id')
  async remove(@ReqUser() user: UserEntity, @Param() param: IdParam) {
    const userTeamId = user.teams[0].team.id;
    const collectionId = param.id;

    try {
      const result = await this.collectionService.delete(
        userTeamId,
        collectionId,
      );
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting collection');
    }
  }
}
