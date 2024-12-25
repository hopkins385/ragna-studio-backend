import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { TextToImageService } from './text-to-image.service';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { FluxProBody } from './dto/flux-pro-body.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import {
  FolderIdParam,
  ProjectIdParam,
  RunIdParam,
} from './dto/text-to-image.param.dto';
import { TextToImagePaginatedQuery } from './dto/text-to-image.query.dto';

@Controller('text-to-image')
export class TextToImageController {
  logger = new Logger(TextToImageController.name);

  constructor(private readonly textToImageService: TextToImageService) {}

  @Post()
  async generateImages(@ReqUser() user: UserEntity, @Body() body: FluxProBody) {
    try {
      const imageUrls = await this.textToImageService.generateFluxProImages(
        user,
        body,
      );
      return { imageUrls };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate images');
    }
  }

  @Get('folders')
  async getFolders(@ReqUser() user: UserEntity) {
    try {
      const folders = await this.textToImageService.findFolders({
        teamId: user.firstTeamId,
      });
      if (folders.length === 0) {
        this.logger.debug(
          'This project has no ai-image folders, creating one ... ',
        );
        const folder = await this.textToImageService.createFolder({
          teamId: user.firstTeamId,
          folderName: 'Default',
        });
        return { folders: [folder] };
      }
      return { folders };
    } catch (error) {
      throw new NotFoundException('Folders not found');
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

  @Get(':folderId/paginated')
  async getFolderImagesRunsPg(
    @Param() param: FolderIdParam,
    @Query() query: TextToImagePaginatedQuery,
  ) {
    const folderId = param.folderId;

    try {
      const [runs, meta] =
        await this.textToImageService.getFolderImagesRunsPaginated(folderId, {
          showDeleted: query.showHidden,
          page: query.page,
        });
      return { runs, meta };
    } catch (error) {
      throw new NotFoundException('Folder not found');
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
