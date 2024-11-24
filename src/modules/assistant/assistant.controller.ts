import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AssistantService } from './assistant.service';
import {
  CreateAssistantBody,
  CreateAssistantDto,
} from './dto/create-assistant.dto';
import {
  UpdateAssistantBody,
  UpdateAssistantDto,
} from './dto/update-assistant.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { FindAssistantDto } from './dto/find-assistant.dto';
import {
  DeleteAssistantBody,
  DeleteAssistantDto,
} from './dto/delete-assistant.dto';
import { FindAllAssistantsDto } from './dto/find-all-assistant.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { PaginateBody, PaginateQuery } from '@/common/dto/paginate.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  async create(@Body() body: CreateAssistantBody) {
    const payload = CreateAssistantDto.fromInput({
      teamId: body.teamId,
      llmId: body.llmId,
      title: body.title,
      description: body.description,
      systemPrompt: body.systemPrompt,
      isShared: body.isShared,
      systemPromptTokenCount: body.systemPromptTokenCount,
      tools: body.tools,
    });
    return await this.assistantService.create(payload);
  }

  @Get()
  async findAll(@ReqUser() user: UserEntity, @Query() query: PaginateQuery) {
    const { page, limit, searchQuery } = query;
    const teamId = user.firstTeamId;

    if (!teamId) {
      throw new NotFoundException('Team not found');
    }

    const [assistants, meta] = await this.assistantService.findAll(
      FindAllAssistantsDto.fromInput({
        teamId,
        page,
        limit,
        searchQuery,
      }),
    );

    return { assistants, meta };
  }

  @Get(':id')
  async findOne(@Param() param: IdParam) {
    const { id: assistantId } = param;

    if (!assistantId) {
      throw new NotFoundException('Assistant not found');
    }

    const assistant = await this.assistantService.findFirst(
      FindAssistantDto.fromInput({
        id: assistantId,
      }),
    );

    if (!assistant) {
      throw new NotFoundException('Assistant not found');
    }

    return { assistant };
  }

  @Patch(':id')
  async update(@Param() param: IdParam, @Body() body: UpdateAssistantBody) {
    const { id: assistantId } = param;

    if (!assistantId) {
      throw new NotFoundException('Assistant not found');
    }

    const assistant = await this.assistantService.findFirst(
      FindAssistantDto.fromInput({
        id: assistantId,
      }),
    );

    if (!assistant) {
      throw new NotFoundException('Assistant not found');
    }

    return await this.assistantService.update(
      UpdateAssistantDto.fromInput({
        id: assistantId,
        teamId: body.teamId,
        llmId: body.llmId,
        title: body.title,
        description: body.description,
        systemPrompt: body.systemPrompt,
        isShared: body.isShared,
        systemPromptTokenCount: body.systemPromptTokenCount,
        tools: body.tools,
      }),
    );
  }

  @Delete(':id')
  async delete(@Param() param: IdParam, @Body() body: DeleteAssistantBody) {
    const { id: assistantId } = param;

    if (!assistantId) {
      throw new NotFoundException('Assistant not found');
    }

    const assistant = await this.assistantService.findFirst(
      FindAssistantDto.fromInput({
        id: assistantId,
      }),
    );

    if (!assistant) {
      throw new NotFoundException('Assistant not found');
    }

    return await this.assistantService.softDelete(
      DeleteAssistantDto.fromInput({
        id: assistantId,
        teamId: body.teamId,
      }),
    );
  }
}
