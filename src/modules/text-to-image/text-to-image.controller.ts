import { BaseController } from '@/common/controllers/base.controller';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { FluxKontextMaxBody } from '@/modules/text-to-image/dto/flux-context-max-inputs.dto';
import { FluxKontextProBody } from '@/modules/text-to-image/dto/flux-context-pro-inputs.dto';
import { FluxProBody } from '@/modules/text-to-image/dto/flux-pro-inputs.dto';
import { FluxUltraBody } from '@/modules/text-to-image/dto/flux-ultra-inputs.dto';
import { GoogleImageGenBody } from '@/modules/text-to-image/dto/google-imagegen-body.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FolderIdParam, ImageIdParam, RunIdParam } from './dto/text-to-image.param.dto';
import { TextToImagePaginatedQuery } from './dto/text-to-image.query.dto';
import { TextToImageService } from './text-to-image.service';

@Controller('text-to-image')
export class TextToImageController extends BaseController {
  logger = new Logger(TextToImageController.name);

  constructor(private readonly textToImageService: TextToImageService) {
    super();
  }

  @Post('flux-pro')
  async generateFluxProImages(@ReqUser() reqUser: RequestUser, @Body() body: FluxProBody) {
    try {
      const imageUrls = await this.textToImageService.generateFluxProImages({
        userId: reqUser.id,
        payload: body,
      });
      return { imageUrls };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('flux-ultra')
  async generateFluxUltraImages(@ReqUser() reqUser: RequestUser, @Body() body: FluxUltraBody) {
    try {
      const imageUrls = await this.textToImageService.generateFluxUltraImages({
        userId: reqUser.id,
        payload: body,
      });
      return { imageUrls };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('flux-kontext-pro')
  async generateFluxKontextImages(
    @ReqUser() reqUser: RequestUser,
    @Body() body: FluxKontextProBody,
  ) {
    try {
      const imageUrls = await this.textToImageService.generateFluxKontextProImages({
        userId: reqUser.id,
        payload: body,
      });
      return { imageUrls };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('flux-kontext-max')
  async generateFluxKontextMaxImages(
    @ReqUser() reqUser: RequestUser,
    @Body() body: FluxKontextMaxBody,
  ) {
    try {
      const imageUrls = await this.textToImageService.generateFluxKontextMaxImages({
        userId: reqUser.id,
        payload: body,
      });
      return { imageUrls };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('google-imagegen')
  async generateGoogleImage(@ReqUser() reqUser: RequestUser, @Body() body: GoogleImageGenBody) {
    try {
      const imageUrls = await this.textToImageService.generateGoogleImagegenImages({
        userId: reqUser.id,
        payload: body,
      });
      return { imageUrls };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('random')
  async getRandomImagesPaginated(@Query() query: PaginateQuery) {
    try {
      const runs = await this.textToImageService.getRandomImagesPaginated({
        page: query.page,
      });
      return { runs };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('folders')
  async getFolders(@ReqUser() reqUser: RequestUser) {
    try {
      const folders = await this.textToImageService.findFolders({
        teamId: reqUser.activeTeamId,
      });
      if (folders.length === 0) {
        this.logger.debug('This project has no ai-image folders, creating one ... ');
        const folder = await this.textToImageService.createFolder({
          teamId: reqUser.activeTeamId,
          folderName: 'Default',
        });
        return { folders: [folder] };
      }
      return { folders };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':imageId/details')
  async getImageDetails(@Param() param: ImageIdParam) {
    try {
      const image = await this.textToImageService.getImageById(param.imageId);
      return { image };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':imageId/download')
  async downloadImage(
    @Param() param: ImageIdParam,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const file = await this.textToImageService.downloadImage(param.imageId);
      return new StreamableFile(file);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Get(':folderId/paginated')
  async getFolderImagesRunsPg(
    @Param() param: FolderIdParam,
    @Query() query: TextToImagePaginatedQuery,
  ) {
    try {
      const { runs, meta } = await this.textToImageService.getFolderImagesRunsPaginated(
        param.folderId,
        {
          showDeleted: query.showHidden,
          page: query.page,
        },
      );
      return { runs, meta };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':folderId')
  async getFolderImagesRuns(@Param() param: FolderIdParam) {
    const showDeleted = false; // TODO: Implement this

    try {
      const runs = await this.textToImageService.getFolderImagesRuns(param.folderId, {
        showDeleted,
      });
      return { runs };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':runId')
  async deleteRun(@Param() param: RunIdParam) {
    const runId = param.runId;
    try {
      const res = await this.textToImageService.softDeleteRun(runId);
      return { success: true, runId };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':runId/toggle-hide')
  async toggleHideRun(@Param() param: RunIdParam) {
    const runId = param.runId;
    try {
      const res = await this.textToImageService.toggleSoftDeleteRun(runId);
      return { success: true, runId };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':runId/undelete')
  async unDeleteRun(@Param() param: RunIdParam) {
    const runId = param.runId;
    try {
      const res = await this.textToImageService.unDeleteRun(runId);
      return { success: true, runId };
    } catch (error) {
      this.handleError(error);
    }
  }
}
