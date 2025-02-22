import { AssistantRepository } from './repositories/assistant.repository';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

interface CreateAssistantFromTemplatePayload {
  teamId: string;
  language: 'de' | 'en';
  templateId: string;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly assistantRepo: AssistantRepository,
    private readonly assistantToolService: AssistantToolService,
  ) {}

  private validateTeamId(teamId: string | undefined): void {
    if (!teamId) {
      throw new BadRequestException('Team ID is required');
    }
  }

  private validateAssistantId(assistantId: string | undefined): void {
    if (!assistantId) {
      throw new BadRequestException('Assistant ID is required');
    }
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

  async create(payload: CreateAssistantDto) {
    // Validate teamId
    this.validateTeamId(payload.teamId);
    // Database call
    try {
      const assistant = await this.assistantRepo.createAssistant(payload);
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createFromTemplate(payload: CreateAssistantFromTemplatePayload) {
    // Validate teamId
    this.validateTeamId(payload.teamId);
    // Database call
    try {
      const assistant =
        await this.assistantRepo.createAssistantFromTemplate(payload);
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async findFirst({ assistantId }: FindAssistantDto) {
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.assistantRepo.getAssistantWithRelations({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDetails({ assistantId }: FindAssistantDto) {
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.assistantRepo.getAssistantDetails({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSystemPrompt(lang: string, assistantId?: string) {
    if (!assistantId) {
      if (lang === 'de') {
        return defaultSystemPrompt.de;
      }
      return defaultSystemPrompt.en;
    }
    try {
      const assistant = await this.assistantRepo.getAssistant({
        assistantId,
      });
      if (!assistant) {
        throw new AssistantNotFoundException(assistantId);
      }
      return assistant?.systemPrompt || '';
    } catch (error) {
      return this.handleError(error);
    }
  }

  async findAll({ teamId, page, limit, searchQuery }: FindAllAssistantsDto) {
    // Validate teamId
    this.validateTeamId(teamId);
    // Database call
    try {
      const assistants = await this.assistantRepo.getAllAssistants({
        teamId,
        page,
        limit,
        searchQuery,
      });
      if (!assistants) {
        throw new AssistantNotFoundException('');
      }
      return assistants;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update({
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
      const assistant = await this.assistantRepo.updateAssistant({
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
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateHasKnowledgeBase({
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
      const assistant =
        await this.assistantRepo.updateAssistantHasKnowledgeBase({
          teamId,
          assistantId,
          hasKnowledgeBase,
        });
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async softDelete({ teamId, assistantId }: DeleteAssistantDto) {
    // Validate teamId
    this.validateTeamId(teamId);
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.assistantRepo.softDeleteAssistant({
        teamId,
        assistantId,
      });
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete({ teamId, assistantId }: DeleteAssistantDto) {
    // Validate teamId
    this.validateTeamId(teamId);
    // Validate assistantId
    this.validateAssistantId(assistantId);
    // Database call
    try {
      const assistant = await this.assistantRepo.hardDeleteAssistant({
        teamId,
        assistantId,
      });
      return assistant;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
