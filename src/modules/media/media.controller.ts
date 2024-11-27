import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaAbleDto } from '@/modules/media-able/dto/media-able.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { MediaAbleBody } from '@/modules/media-able/dto/media-able-body.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id')
  async findFirst(@Param() param: IdParam) {
    const media = await this.mediaService.findFirst(param.id);
    return { media };
  }

  @Post('for')
  @HttpCode(200)
  async findAllFor(@Body() body: MediaAbleBody) {
    const { model } = body;
    const mediaAbleDto = MediaAbleDto.fromInput({
      id: model.id,
      type: model.type,
    });

    try {
      const medias = await this.mediaService.findAllFor(mediaAbleDto);
      return { medias };
    } catch (error) {
      throw new NotFoundException('Media not found');
    }
  }

  @Post('for/paginate')
  @HttpCode(200)
  async paginateFindAllFor(
    @Body() body: MediaAbleBody,
    @Query() query: PaginateQuery,
  ) {
    const { model } = body;
    const mediaAbleDto = MediaAbleDto.fromInput({
      id: model.id,
      type: model.type,
    });

    try {
      const [medias, meta] = await this.mediaService.paginateFindAllFor(
        mediaAbleDto,
        query.page,
        query.limit,
      );
      return { medias, meta };
    } catch (error) {
      throw new NotFoundException('Media not found');
    }
  }

  @Delete(':id')
  async remove(@ReqUser() user: UserEntity, @Param() param: IdParam) {
    try {
      await this.mediaService.delete({ userId: user.id, mediaId: param.id });
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting media');
    }
  }
}
