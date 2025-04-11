import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { CreateRecordBody } from './dto/create-record-body.dto';
import { CreateRecordDto, FindRecordsDto } from './dto/create-record.dto';
import { RecordService } from './record.service';

@Controller('record')
export class RecordController {
  private readonly logger = new Logger(RecordController.name);

  constructor(private readonly recordService: RecordService) {}

  @Post()
  async create(@ReqUser() reqUser: RequestUser, @Body() body: CreateRecordBody) {
    const teamId = reqUser.activeTeamId;
    const payload = CreateRecordDto.fromInput({
      collectionId: body.collectionId,
      mediaId: body.mediaId,
      teamId,
    });

    try {
      const record = await this.recordService.create(payload);
      return { record };
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new InternalServerErrorException('Failed to create record');
    }
  }

  @Get(':id')
  async findOne(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    const payload = FindRecordsDto.fromInput({
      collectionId: param.id,
      teamId: reqUser.activeTeamId,
    });

    try {
      const records = await this.recordService.findAll(payload);
      return { records };
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new InternalServerErrorException('Failed to fetch record');
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
      this.logger.error(`Error: ${error?.message}`);
      throw new InternalServerErrorException('Failed to fetch records');
    }
  }

  @Delete(':id')
  async remove(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    const teamId = reqUser.activeTeamId;
    const recordId = param.id;

    try {
      await this.recordService.delete({
        teamId,
        recordId,
      });
      return { message: 'Record deleted successfully' };
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new InternalServerErrorException('Failed to delete record');
    }
  }
}
