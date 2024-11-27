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
} from '@nestjs/common';
import { RecordService } from './record.service';
import { CreateRecordDto, FindRecordsDto } from './dto/create-record.dto';
import { CreateRecordBody } from './dto/create-record-body.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  async create(@ReqUser() user: UserEntity, @Body() body: CreateRecordBody) {
    const teamId = user.teams[0].team.id;
    const payload = CreateRecordDto.fromInput({
      collectionId: body.collectionId,
      mediaId: body.mediaId,
      teamId,
    });

    try {
      const record = await this.recordService.create(payload);
      return { record };
    } catch (error) {
      throw new NotFoundException('Record not found');
    }
  }

  @Get(':id')
  async findAllPaginated(
    @ReqUser() user: UserEntity,
    @Param() param: IdParam,
    @Query() query: PaginateQuery,
  ) {
    const teamId = user.teams[0].team.id;
    const collectionId = param.id;
    const payload = FindRecordsDto.fromInput({
      collectionId,
      teamId,
    });

    try {
      const [records, meta] = await this.recordService.findAllPaginated(
        payload,
        query.page,
        query.limit,
      );
      return { records, meta };
    } catch (error) {
      throw new NotFoundException('Records not found');
    }
  }
}
