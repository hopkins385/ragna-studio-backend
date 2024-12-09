import type { LargeLangModel } from '@prisma/client';
import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { Pipe } from '@/common/utils/pipe/pipeline';

interface NewOrganizationDto {
  userId: string;
  name: string;
}

interface NewTeamDto {
  userId: string;
  name: string;
  organisationId: string;
}

interface NewCreditsDto {
  teamId: string;
  userId: string;
  amount: number;
}

interface NewAssistantDto {
  userId: string;
  teamId: string;
}

interface RunPayload {
  userId: string;
  userName: string;
  orgName: string;
}

interface PipelinePayload {
  userId: string;
  userName: string;
  orgName: string;
}

interface PipelineStepResult extends Partial<PipelinePayload> {
  userId: string;
  teamId: string;
  organisationId?: string;
  assistantId?: string;
}

export class CreatesNewUserAction {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    this.prisma = prisma;
  }

  async updateUserName(pay: {
    userId: string;
    orgName: string;
    firstName: string;
    lastName: string;
  }) {
    const user = await this.prisma.user.update({
      where: { id: pay.userId },
      data: {
        firstName: pay.firstName,
        lastName: pay.lastName,
        name: `${pay.firstName} ${pay.lastName}`,
      },
    });

    return { userId: user.id, orgName: pay.orgName };
  }

  async createOrganization({
    userId,
    orgName,
  }: {
    userId: string;
    orgName: string;
  }) {
    const org = await this.prisma.organisation.create({
      data: {
        name: orgName,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { organisationId: org.id, userId };
  }

  async createTeam({ name, organisationId, userId }: NewTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        name,
        organisationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Add the user to the team
    await this.prisma.teamUser.create({
      data: {
        teamId: team.id,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { teamId: team.id, userId };
  }

  async createCredits({ userId, teamId, amount }: NewCreditsDto) {
    const result = await this.prisma.credit.create({
      data: {
        userId,
        amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { teamId, userId };
  }

  async assignAdminRoleToUser({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }) {
    // get the admin role
    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // assign the admin role to the user
    const role = await this.prisma.userRole.create({
      data: {
        userId,
        roleId: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { teamId, userId };
  }

  private async findSuitableLLM(): Promise<LargeLangModel> {
    const claude = await this.prisma.largeLangModel.findFirst({
      where: {
        provider: 'anthropic',
        apiName: { startsWith: 'claude-3-5' },
      },
    });

    if (!claude) {
      console.error('claude-3-5 not found');

      const model = await this.prisma.largeLangModel.findMany({
        where: {
          provider: 'anthropic',
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!model) {
        throw new Error('No suitable LLM found');
      }

      return model[0];
    }

    return claude;
  }

  async getAllTools() {
    return this.prisma.tool.findMany();
  }

  async createAssistant({ teamId, userId }: NewAssistantDto) {
    const { id: llmId } = await this.findSuitableLLM();

    const date = new Date();

    const tools = await this.getAllTools().then((t) =>
      t.map((tool) => ({
        toolId: tool.id,
        createdAt: date,
        updatedAt: date,
      })),
    );

    if (!tools.length) {
      throw new Error('No tools found');
    }

    const assistant = await this.prisma.assistant.create({
      data: {
        teamId,
        llmId,
        title: 'RAGNA Agent',
        description: 'RAGNA Agent',
        systemPrompt: 'You are a friendly and helpful assistant\n',
        isShared: false,
        systemPromptTokenCount: 10,
        createdAt: date,
        updatedAt: date,
        tools: {
          createMany: {
            data: tools,
          },
        },
      },
    });

    // add the assistant to user favorites
    await this.prisma.userFavorite.create({
      data: {
        userId,
        favoriteId: assistant.id,
        favoriteType: 'assistant',
      },
    });

    return { userId, teamId, assistantId: assistant.id };
  }

  async updateUserOnboardingStatus({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { onboardedAt: new Date() },
    });
    return { userId: user.id, teamId };
  }

  private createPipeline() {
    const maxRetries = 3;
    const pipeLine = Pipe.create(maxRetries, async (p) => {
      p.addStep(async ({ userId, userName, orgName }: PipelinePayload) => {
        if (!userId || !userName || !orgName)
          throw new Error('Missing required fields');
        const name = userName.split(' ');
        return this.updateUserName({
          userId,
          orgName,
          firstName: name[0] || 'User',
          lastName: name[1] || 'Name',
        });
      });
      p.addStep(async ({ userId, orgName }: PipelineStepResult) => {
        if (!userId || !orgName)
          throw new Error('Missing required fields: userId or orgName');
        return this.createOrganization({ userId, orgName });
      });
      p.addStep(async ({ userId, organisationId }: PipelineStepResult) => {
        if (!userId || !organisationId)
          throw new Error('Missing required fields: userId or organisationId');
        return this.createTeam({
          userId,
          name: 'Default Team',
          organisationId,
        });
      });
      p.addStep(async ({ userId, teamId }: PipelineStepResult) => {
        if (!userId || !teamId)
          throw new Error('Missing required fields: userId or teamId');
        return this.createCredits({ teamId, userId, amount: 1000 });
      });
      p.addStep(async ({ userId, teamId }: PipelineStepResult) => {
        if (!userId || !teamId)
          throw new Error('Missing required fields: userId or teamId');
        return this.assignAdminRoleToUser({ userId, teamId });
      });
      p.addStep(async ({ userId, teamId }: PipelineStepResult) => {
        if (!userId || !teamId)
          throw new Error('Missing required fields: userId or teamId');
        return this.updateUserOnboardingStatus({ userId, teamId });
      });
      p.addStep(async ({ userId, teamId }: PipelineStepResult) => {
        if (!userId || !teamId)
          throw new Error('Missing required fields: userId or teamId');
        return this.createAssistant({ userId, teamId });
      });
    });

    return pipeLine;
  }

  async runPipeline(payload: RunPayload): Promise<void> {
    const pipeLine = this.createPipeline();

    pipeLine.lastStep(() => {
      console.log('Successfully completed new user action pipeline');
    });

    try {
      await pipeLine.run(payload);
    } catch (error: any) {
      const errorContext =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Pipeline execution failed:', errorContext);
      throw new Error(`Failed to create new user`);
    }
  }
}
