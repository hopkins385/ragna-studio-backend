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
import { DeleteAssistantDto } from './dto/delete-assistant.dto';
import { FindAllAssistantsDto } from './dto/find-all-assistant.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { UpdateAssistantHasKnowledgeBody } from './dto/update-assistant-knw-body.dto';
import { CreateAssistantFromTemplateBody } from './dto/create-from-template.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  async create(@Body() body: CreateAssistantBody) {
    try {
      return await this.assistantService.create(
        CreateAssistantDto.fromInput({
          teamId: body.teamId,
          llmId: body.llmId,
          title: body.title,
          description: body.description,
          systemPrompt: body.systemPrompt,
          isShared: body.isShared,
          tools: body.tools,
        }),
      );
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

    try {
      const result = await this.assistantService.findAll(
        FindAllAssistantsDto.fromInput({
          teamId: user.firstTeamId,
          page,
          limit,
          searchQuery,
        }),
      );

      if (!result) {
        throw new Error('Assistants not found');
      }

      return {
        assistants: result.assistants,
        meta: result.meta,
      };
    } catch (error) {
      throw new NotFoundException('Assistants not found');
    }
  }

  @Get(':id')
  async findOne(@Param() param: IdParam) {
    try {
      const assistant = await this.assistantService.getOne(
        FindAssistantDto.fromInput({
          id: param.id,
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
    try {
      return await this.assistantService.update(
        UpdateAssistantDto.fromInput({
          id: param.id,
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
    try {
      return await this.assistantService.updateHasKnowledgeBase({
        teamId: user.firstTeamId,
        assistantId: param.id,
        hasKnowledgeBase: body.hasKnowledgeBase,
      });
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }

  @Delete(':id')
  async delete(@ReqUser() user: UserEntity, @Param() param: IdParam) {
    try {
      return await this.assistantService.softDelete(
        DeleteAssistantDto.fromInput({
          id: param.id,
          teamId: user.firstTeamId,
        }),
      );
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }
}
