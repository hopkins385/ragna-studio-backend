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
  InternalServerErrorException,
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
import { UpdateAssistantHasKnowledgeBody } from './dto/update-assistant-knw-body.dto';
import { CreateAssistantFromTemplateBody } from './dto/create-from-template.dto';

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
      tools: body.tools,
    });
    try {
      return await this.assistantService.create(payload);
    } catch (error) {
      throw new InternalServerErrorException('Error creating assistant');
    }
  }

  @Post('from-template')
  async createFromTemplate(
    @ReqUser() user: UserEntity,
    @Body() body: CreateAssistantFromTemplateBody,
  ) {
    try {
      const assistant = await this.assistantService.createFromTemplate({
        teamId: user.firstTeamId,
        templateId: body.templateId,
        language: body.language,
      });
      return { assistant };
    } catch (error) {
      throw new InternalServerErrorException('Error creating assistant');
    }
  }

  @Get()
  async findAll(@ReqUser() user: UserEntity, @Query() query: PaginateQuery) {
    const { page, limit, searchQuery } = query;
    const teamId = user.firstTeamId;

    if (!teamId) {
      throw new NotFoundException('Team not found');
    }

    try {
      const [assistants, meta] = await this.assistantService.findAll(
        FindAllAssistantsDto.fromInput({
          teamId,
          page,
          limit,
          searchQuery,
        }),
      );

      return { assistants, meta };
    } catch (error) {
      throw new NotFoundException('Assistants not found');
    }
  }

  @Get(':id')
  async findOne(@Param() param: IdParam) {
    const { id: assistantId } = param;

    if (!assistantId) {
      throw new NotFoundException('Assistant not found');
    }

    try {
      const assistant = await this.assistantService.findFirst(
        FindAssistantDto.fromInput({
          id: assistantId,
        }),
      );

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      return { assistant };
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }

  @Patch(':id')
  async update(@Param() param: IdParam, @Body() body: UpdateAssistantBody) {
    const { id: assistantId } = param;

    if (!assistantId) {
      throw new NotFoundException('Assistant not found');
    }

    try {
      const assistant = await this.assistantService.findFirst(
        FindAssistantDto.fromInput({
          id: assistantId,
        }),
      );

      if (!assistant) {
        throw new Error('Assistant not found');
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
          hasKnowledgeBase: body.hasKnowledgeBase,
          hasWorkflow: body.hasWorkflow,
          tools: body.tools,
        }),
      );
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }

  @Patch(':id/has-knowledge')
  async updateHasKnowledgeBase(
    @ReqUser() user: UserEntity,
    @Param() param: IdParam,
    @Body() body: UpdateAssistantHasKnowledgeBody,
  ) {
    const { id: assistantId } = param;

    if (!assistantId) {
      throw new NotFoundException('Assistant not found');
    }

    try {
      const assistant = await this.assistantService.findFirst(
        FindAssistantDto.fromInput({
          id: assistantId,
        }),
      );

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      return await this.assistantService.updateHasKnowledgeBase({
        teamId: user.firstTeamId,
        assistantId: assistant.id,
        hasKnowledgeBase: body.hasKnowledgeBase,
      });
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }

  @Delete(':id')
  async delete(@ReqUser() user: UserEntity, @Param() param: IdParam) {
    const { id: assistantId } = param;

    if (!assistantId) {
      throw new NotFoundException('Assistant not found');
    }

    try {
      const assistant = await this.assistantService.findFirst(
        FindAssistantDto.fromInput({
          id: assistantId,
        }),
      );

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      return await this.assistantService.softDelete(
        DeleteAssistantDto.fromInput({
          id: assistantId,
          teamId: user.firstTeamId,
        }),
      );
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }
}
