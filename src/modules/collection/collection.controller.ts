import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CollectionAbleDto } from '../collection-able/dto/collection-able.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { CollectionService } from './collection.service';
import { CreateCollectionBody } from './dto/create-collection-body.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FindCollectionForBody } from './dto/find-collection-for-body.dto';
import { UpdateCollectionBody } from './dto/update-collection-body.dto';

@Controller('collection')
export class CollectionController extends BaseController {
  constructor(private readonly collectionService: CollectionService) {
    super();
  }

  @Post()
  async create(@ReqUser() reqUser: RequestUser, @Body() body: CreateCollectionBody) {
    try {
      const collection = await this.collectionService.createCollection(
        CreateCollectionDto.fromInput({
          teamId: reqUser.activeTeamId,
          name: body.name,
          description: body.description,
        }),
      );
      return { collection };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  async findAllPaginated(@ReqUser() reqUser: RequestUser, @Query() query: PaginateQuery) {
    try {
      const [collections, meta] = await this.collectionService.findAllPaginated(
        reqUser.activeTeamId,
        +query.page,
      );
      return { collections, meta };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('all')
  async findAll(@ReqUser() reqUser: RequestUser) {
    try {
      const collections = await this.collectionService.findAll(reqUser.activeTeamId);
      return { collections };
    } catch (error) {
      this.handleError(error);
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
      this.handleError(error);
    }
  }

  @Get(':id')
  async findOne(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    const collectionId = param.id;

    try {
      const collection = await this.collectionService.findFirst(reqUser.activeTeamId, collectionId);
      return { collection };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  async update(
    @ReqUser() reqUser: RequestUser,
    @Param() param: IdParam,
    @Body() body: UpdateCollectionBody,
  ) {
    const userTeamId = reqUser.activeTeamId;
    const collectionId = param.id;

    const collection = await this.collectionService.findFirst(userTeamId, collectionId);

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
      this.handleError(error);
    }
  }

  @Delete(':id')
  async remove(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    const userTeamId = reqUser.activeTeamId;
    const collectionId = param.id;

    try {
      const result = await this.collectionService.delete(userTeamId, collectionId);
      return { status: 'ok' };
    } catch (error) {
      this.handleError(error);
    }
  }
}
