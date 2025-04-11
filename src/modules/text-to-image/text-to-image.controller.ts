import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FluxProBody } from './dto/flux-pro-body.dto';
import { FluxUltraBody } from './dto/flux-ultra-body.dto';
import { FolderIdParam, RunIdParam } from './dto/text-to-image.param.dto';
import { TextToImagePaginatedQuery } from './dto/text-to-image.query.dto';
import { TextToImageService } from './text-to-image.service';

@Controller('text-to-image')
export class TextToImageController {
  logger = new Logger(TextToImageController.name);

  constructor(private readonly textToImageService: TextToImageService) {}

  @Post('flux-pro')
  async generateFluxProImages(@ReqUser() reqUser: RequestUser, @Body() body: FluxProBody) {
    try {
      const imageUrls = await this.textToImageService.generateFluxProImages(reqUser.id, body);
      return { imageUrls };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate images');
    }
  }

  @Post('flux-ultra')
  async generateFluxUltraImages(@ReqUser() reqUser: RequestUser, @Body() body: FluxUltraBody) {
    try {
      const imageUrls = await this.textToImageService.generateFluxUltraImages(reqUser.id, body);
      return { imageUrls };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate images');
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
      throw new NotFoundException('Folder not found');
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
      throw new NotFoundException('Folders not found');
    }
  }

  @Get(':id/download')
  async downloadImage(@Param() param: IdParam, @Res({ passthrough: true }) response: Response) {
    try {
      const file = await this.textToImageService.downloadImage(param.id);
      return new StreamableFile(file);
    } catch (error: any) {
      this.logger.error(`Failed to download image: ${error?.message}`);
      throw new NotFoundException('Image not found');
    }
  }

  @Get(':folderId/paginated')
  async getFolderImagesRunsPg(
    @Param() param: FolderIdParam,
    @Query() query: TextToImagePaginatedQuery,
  ) {
    const folderId = param.folderId;

    try {
      const [runs, meta] = await this.textToImageService.getFolderImagesRunsPaginated(folderId, {
        showDeleted: query.showHidden,
        page: query.page,
      });
      return { runs, meta };
    } catch (error) {
      throw new NotFoundException('Folder not found');
    }
  }

  @Get(':folderId')
  async getFolderImagesRuns(@Param() param: FolderIdParam) {
    const folderId = param.folderId;
    const showDeleted = false; // TODO: Implement this

    try {
      const runs = await this.textToImageService.getFolderImagesRuns(folderId, {
        showDeleted,
      });
      return { runs };
    } catch (error) {
      throw new NotFoundException('Folder not found');
    }
  }

  @Delete(':runId')
  async deleteRun(@Param() param: RunIdParam) {
    const runId = param.runId;

    try {
      const res = await this.textToImageService.softDeleteRun(runId);
      return { success: true, runId };
    } catch (error) {
      throw new NotFoundException('Run not found');
    }
  }

  @Patch(':runId/toggle-hide')
  async toggleHideRun(@Param() param: RunIdParam) {
    const runId = param.runId;

    try {
      const res = await this.textToImageService.toggleSoftDeleteRun(runId);
      return { success: true, runId };
    } catch (error) {
      throw new NotFoundException('Run not found');
    }
  }

  @Patch(':runId/undelete')
  async unDeleteRun(@Param() param: RunIdParam) {
    const runId = param.runId;

    try {
      const res = await this.textToImageService.unDeleteRun(runId);
      return { success: true, runId };
    } catch (error) {
      throw new NotFoundException('Run not found');
    }
  }
}
