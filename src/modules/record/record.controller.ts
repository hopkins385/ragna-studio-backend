import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Logger,
  InternalServerErrorException,
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
  private readonly logger = new Logger(RecordController.name);

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
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new InternalServerErrorException('Failed to create record');
    }
  }

  @Get(':id')
  async findOne(@ReqUser() user: UserEntity, @Param() param: IdParam) {
    const payload = FindRecordsDto.fromInput({
      collectionId: param.id,
      teamId: user.firstTeamId,
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
    @ReqUser() user: UserEntity,
    @Param() param: IdParam,
    @Query() query: PaginateQuery,
  ) {
    const teamId = user.firstTeamId;
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
  async remove(@ReqUser() user: UserEntity, @Param() param: IdParam) {
    const teamId = user.firstTeamId;
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
