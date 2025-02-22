import { AssistantRepository } from './repositories/assistant.repository';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { FindAssistantDto } from './dto/find-assistant.dto';
import { FindAllAssistantsDto } from './dto/find-all-assistant.dto';
import { DeleteAssistantDto } from './dto/delete-assistant.dto';
import { AssistantToolService } from '../assistant-tool/assistant-tool.service';
import { defaultSystemPrompt } from './constants/default-system-prompt.constant';
import { AssistantNotFoundException } from './exceptions/assistant-not-found.exception';
import { BaseService } from '@/common/service/base.service';

interface CreateAssistantFromTemplatePayload {
  teamId: string;
  language: 'de' | 'en';
  templateId: string;
}

@Injectable()
export class AssistantService extends BaseService<any> {
  constructor(
    private readonly repository: AssistantRepository,
    private readonly assistantToolService: AssistantToolService,
  ) {
    super(AssistantService.name);
  }

  private validateTeamId(teamId: string | undefined): void {
    this.validateId(teamId, 'Team ID');
  }

  private validateAssistantId(assistantId: string | undefined): void {
    this.validateId(assistantId, 'Assistant ID');
  }

  private handleError(error: unknown) {
    if (error instanceof AssistantNotFoundException) {
      throw error;
    }
    if (error instanceof Error) {
      this.logger.error(`Error: ${error.message}`, error.stack);
      if (error.message.includes('not found')) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException(error.message);
    }
    throw new InternalServerErrorException('Unknown error');
  }

  public async create(payload: CreateAssistantDto) {
    // Validate teamId
    this.validateTeamId(payload.teamId);
    // Database call
    try {
      const assistant = await this.repository.createAssistant(payload);
      return assistant;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async createFromTemplate(payload: CreateAssistantFromTemplatePayload) {
    // Validate teamId
    this.validateTeamId(payload.teamId);
    // Database call
    try {
      const assistant =
        await this.repository.createAssistantFromTemplate(payload);
      return assistant;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getOne({ assistantId }: FindAssistantDto) {
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.repository.getAssistantWithRelations({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }
      return assistant;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getDetails({ assistantId }: FindAssistantDto) {
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.repository.getAssistantDetails({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }
      return assistant;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getSystemPrompt(lang: string, assistantId?: string) {
    if (!assistantId) {
      if (lang === 'de') {
        return defaultSystemPrompt.de;
      }
      return defaultSystemPrompt.en;
    }
    try {
      const assistant = await this.repository.getAssistant({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }
      return assistant?.systemPrompt || '';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findAll({
    teamId,
    page,
    limit,
    searchQuery,
  }: FindAllAssistantsDto): Promise<{
    assistants: any[];
    meta: any;
  }> {
    // Validate teamId
    this.validateTeamId(teamId);
    // Database call
    try {
      const [assistants, meta] = await this.repository.getAllAssistants({
        teamId,
        page,
        limit,
        searchQuery,
      });
      if (!assistants) {
        throw new AssistantNotFoundException('');
      }
      return { assistants, meta };
    } catch (error) {
      this.handleError(error);
    }
  }

  public async update({
    teamId,
    assistantId,
    title,
    llmId,
    description,
    systemPrompt,
    isShared,
    hasKnowledgeBase,
    hasWorkflow,
    tools,
  }: UpdateAssistantDto) {
    // Validate teamId
    this.validateTeamId(teamId);
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.repository.getAssistant({
        assistantId,
      });

      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }

      const updatedAssistant = await this.repository.updateAssistant({
        teamId,
        assistantId,
        title,
        llmId,
        description,
        systemPrompt,
        isShared,
        hasKnowledgeBase,
        hasWorkflow,
      });
      await this.assistantToolService.updateMany(assistantId, tools || []);
      return updatedAssistant;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async updateHasKnowledgeBase({
    teamId,
    assistantId,
    hasKnowledgeBase,
  }: Partial<UpdateAssistantDto>) {
    // Validate teamId
    this.validateTeamId(teamId);
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      // find assistant
      const assistant = await this.repository.getAssistant({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }

      const updatedAssistant =
        await this.repository.updateAssistantHasKnowledgeBase({
          teamId,
          assistantId,
          hasKnowledgeBase,
        });
      return updatedAssistant;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async softDelete({ teamId, assistantId }: DeleteAssistantDto) {
    // Validate teamId
    this.validateTeamId(teamId);
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.repository.getAssistant({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }

      const updatedAssistant = await this.repository.softDeleteAssistant({
        teamId,
        assistantId,
      });
      return updatedAssistant;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async delete({ teamId, assistantId }: DeleteAssistantDto) {
    // Validate teamId
    this.validateTeamId(teamId);
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.repository.getAssistant({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }

      const result = await this.repository.hardDeleteAssistant({
        teamId,
        assistantId,
      });
      return result;
    } catch (error) {
      this.handleError(error);
    }
  }
}
