import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { MediaAbleBody } from '@/modules/media-able/dto/media-able-body.dto';
import { MediaAbleDto } from '@/modules/media-able/dto/media-able.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController extends BaseController {
  constructor(private readonly mediaService: MediaService) {
    super();
  }

  @Get(':id')
  async findFirst(@Param() param: IdParam) {
    try {
      const media = await this.mediaService.findFirst(param.id);
      return { media };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Post('for')
  @HttpCode(200)
  async findAllFor(@Body() body: MediaAbleBody) {
    try {
      const medias = await this.mediaService.findAllFor(
        MediaAbleDto.fromInput({
          id: body.model.id,
          type: body.model.type,
        }),
      );
      return { medias };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Post('for/paginate')
  @HttpCode(200)
  async paginateFindAllFor(
    @Query() query: PaginateQuery,
    @Body() body: MediaAbleBody,
    @ReqUser() reqUser: RequestUser,
  ) {
    const mediaAbleDto = MediaAbleDto.fromInput({
      id: body.model.id,
      type: body.model.type,
    });

    const userMediaAbleDto = MediaAbleDto.fromInput({
      id: reqUser.id,
      type: 'user',
    });

    try {
      const { medias, meta } = await this.mediaService.findAllMediaFor({
        mediaModel: mediaAbleDto,
        userMediaModel: userMediaAbleDto,
        page: query.page,
        limit: query.limit,
      });
      return { medias, meta };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  async remove(@Param() param: IdParam) {
    try {
      await this.mediaService.delete({ mediaId: param.id });
      return { status: 'ok' };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
