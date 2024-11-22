import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { FindAssistantDto } from '../dto/find-assistant.dto';

@Injectable()
export class AssistantOwnerGuard implements CanActivate {
  constructor(private readonly assistantService: AssistantService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const {
      user,
      params: { id: assistantId },
    } = request;

    const assistant = await this.assistantService.findFirst(
      FindAssistantDto.fromInput({
        id: assistantId,
      }),
    );

    if (!assistant) {
      return false;
    }

    const { teamId: userTeamId } = user;
    const {
      team: { id: assistantTeamId },
    } = assistant;

    if (assistantTeamId !== userTeamId) {
      return false;
    }

    request.assistant = assistant;

    return true;
  }
}
