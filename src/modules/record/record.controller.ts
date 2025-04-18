import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { CreateRecordBody } from './dto/create-record-body.dto';
import { CreateRecordDto, FindRecordsDto } from './dto/create-record.dto';
import { RecordService } from './record.service';

@Controller('record')
export class RecordController extends BaseController {
  constructor(private readonly recordService: RecordService) {
    super();
  }

  @Post()
  async create(@ReqUser() reqUser: RequestUser, @Body() body: CreateRecordBody) {
    try {
      const record = await this.recordService.create(
        CreateRecordDto.fromInput({
          collectionId: body.collectionId,
          mediaId: body.mediaId,
          teamId: reqUser.activeTeamId,
        }),
      );
      return { record };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get(':id')
  async findOne(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    try {
      const records = await this.recordService.findAll(
        FindRecordsDto.fromInput({
          collectionId: param.id,
          teamId: reqUser.activeTeamId,
        }),
      );
      return { records };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get(':id/paginated')
  async findAllPaginated(
    @ReqUser() reqUser: RequestUser,
    @Param() param: IdParam,
    @Query() query: PaginateQuery,
  ) {
    const teamId = reqUser.activeTeamId;
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
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  async remove(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    try {
      await this.recordService.delete({
        teamId: reqUser.activeTeamId,
        recordId: param.id,
      });
      return { success: true };
    } catch (error: any) {
      this.handleError(error);
    }
  }
}
