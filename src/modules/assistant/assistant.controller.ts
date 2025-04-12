import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { CreateAssistantBody } from '@/modules/assistant/dto/create-assistant-body.dto';
import { UpdateAssistantBody } from '@/modules/assistant/dto/update-assistant-body.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { CreateAssistantFromTemplateBody } from './dto/create-from-template.dto';
import { DeleteAssistantDto } from './dto/delete-assistant.dto';
import { FindAllAssistantsDto } from './dto/find-all-assistant.dto';
import { FindAssistantDto } from './dto/find-assistant.dto';
import { UpdateAssistantHasKnowledgeBody } from './dto/update-assistant-knw-body.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  async create(@ReqUser() reqUser: RequestUser, @Body() body: CreateAssistantBody) {
    try {
      return await this.assistantService.create(
        CreateAssistantDto.fromInput({
          teamId: reqUser.activeTeamId,
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
    @ReqUser() reqUser: RequestUser,
    @Body() body: CreateAssistantFromTemplateBody,
  ) {
    try {
      const assistant = await this.assistantService.createFromTemplate({
        teamId: reqUser.activeTeamId,
        templateId: body.templateId,
        language: body.language,
      });
      return { assistant };
    } catch (error) {
      throw new InternalServerErrorException('Error creating assistant');
    }
  }

  @Get()
  async findAll(@ReqUser() reqUser: RequestUser, @Query() query: PaginateQuery) {
    try {
      const result = await this.assistantService.findAll(
        FindAllAssistantsDto.fromInput({
          teamId: reqUser.activeTeamId,
          page: query.page,
          limit: query.limit,
          searchQuery: query.searchQuery,
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
  async update(
    @ReqUser() reqUser: RequestUser,
    @Param() param: IdParam,
    @Body() body: UpdateAssistantBody,
  ) {
    try {
      return await this.assistantService.update(
        UpdateAssistantDto.fromInput({
          id: param.id,
          teamId: reqUser.activeTeamId,
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
    @ReqUser() reqUser: RequestUser,
    @Param() param: IdParam,
    @Body() body: UpdateAssistantHasKnowledgeBody,
  ) {
    try {
      return await this.assistantService.updateHasKnowledgeBase({
        teamId: reqUser.activeTeamId,
        assistantId: param.id,
        hasKnowledgeBase: body.hasKnowledgeBase,
      });
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }

  @Delete(':id')
  async delete(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    const deleteAssistantDto = DeleteAssistantDto.fromInput({
      id: param.id,
      teamId: reqUser.activeTeamId,
    });
    try {
      return await this.assistantService.softDelete(deleteAssistantDto);
    } catch (error) {
      throw new NotFoundException('Assistant not found');
    }
  }
}
