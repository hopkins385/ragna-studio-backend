import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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

@Controller('text-to-image')
export class TextToImageController {
  constructor(private readonly textToImageService: TextToImageService) {}

  @Post()
  async generateImages(@ReqUser() user: UserEntity, @Body() body: FluxProBody) {
    const imageUrls = await this.textToImageService.generateFluxProImages(
      user,
      body,
    );

    return { imageUrls };
  }

  @Get('folders')
  async getFolders(@ReqUser() user: UserEntity) {
    const folders = await this.textToImageService.findFolders({
      teamId: user.teams?.[0].team.id,
    });
    if (folders.length === 0) {
      console.log('This project has no ai-image folders, creating one ... ');
      const folder = await this.textToImageService.createFolder({
        teamId: user.teams?.[0].team.id,
        folderName: 'Default',
      });
      return { folders: [folder] };
    }
    return { folders };
  }

  @Get(':folderId')
  async getFolderImagesRuns(@Param() param: FolderIdParam) {
    const folderId = param.folderId;
    const showDeleted = false; // TODO: Implement this
    const runs = await this.textToImageService.getFolderImagesRuns(folderId, {
      showDeleted,
    });
    return { runs };
  }

  @Get(':folderId/paginated')
  async getFolderImagesRunsPg(
    @Param() param: FolderIdParam,
    @Query() query: PaginateQuery,
  ) {
    const folderId = param.folderId;
    const showDeleted = false; // TODO: Implement this
    const [runs, meta] =
      await this.textToImageService.getFolderImagesRunsPaginated(folderId, {
        showDeleted,
        page: query.page,
      });
    return { runs, meta };
  }

  @Get('random')
  async getRandomImagesPaginated(@Query() query: PaginateQuery) {
    const runs = await this.textToImageService.getRandomImagesPaginated({
      page: query.page,
    });
    return { runs };
  }

  @Delete(':runId')
  async deleteRun(@Param() param: RunIdParam) {
    const runId = param.runId;
    const res = await this.textToImageService.softDeleteRun(runId);
    return { success: true, runId };
  }

  @Patch(':runId/toggle-hide')
  async toggleHideRun(@Param() param: RunIdParam) {
    const runId = param.runId;
    const res = await this.textToImageService.toggleSoftDeleteRun(runId);
    return { success: true, runId };
  }

  @Patch(':runId/undelete')
  async unDeleteRun(@Param() param: RunIdParam) {
    const runId = param.runId;
    const res = await this.textToImageService.unDeleteRun(runId);
    return { success: true, runId };
  }
}
