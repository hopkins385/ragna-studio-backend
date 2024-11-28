import { Injectable } from '@nestjs/common';
import { WorkflowService } from '@/modules/workflow/workflow.service';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { FlowJob, FlowProducer, JobsOptions } from 'bullmq';
import { AssistantJobDto } from '@/modules/assistant/dto/assistant-job.dto';

@Injectable()
export class WorkflowExecutionService {
  constructor(
    @InjectFlowProducer('workflow')
    private readonly flowProducer: FlowProducer,
    private readonly workflowService: WorkflowService,
  ) {}
  /**
   * Workflow[] -> WorkflowStep -> Document -> DocumentItem[]
   * Workflow[] -> Assistant
   *
   */

  getFlowRows(payload: {
    userId: string;
    workflowId: string;
    workflowSteps: any[];
  }): FlowJob[] {
    const stepsCount = payload.workflowSteps.length;
    const startStepIndex = stepsCount - 1;
    const rowCount =
      payload.workflowSteps[0].document?.documentItems.length || 0;
    const rows = [];

    const defaultJobOpts = {
      removeOnComplete: true,
      removeOnFail: true,
    } as JobsOptions;

    function jobChild(stepIndex: number, rowIndex: number): any {
      const { assistant, document, name, step, inputSteps } =
        payload.workflowSteps[stepIndex];
      const documentItem = document.documentItems[rowIndex];

      if (!assistant) {
        throw new Error(
          `Assistant not found for step ${stepIndex} with name ${payload.workflowSteps[stepIndex].name}`,
        );
      }

      const inputDocumentItemIds = inputSteps.map((inputStep: any) => {
        const inputDocument = payload.workflowSteps.find(
          (step) => step.id === inputStep,
        );
        if (!inputDocument) {
          return;
        }
        return inputDocument.document.documentItems[rowIndex].id;
      });

      const jobData = AssistantJobDto.fromInput({
        stepIndex,
        rowIndex,
        stepName: name,
        assistantId: assistant.id,
        llmProvider: assistant.llm.provider,
        llmNameApi: assistant.llm.apiName,
        inputDocumentItemIds,
        documentItemId: documentItem.id,
        systemPrompt: assistant.systemPrompt,
        temperature: 0.5,
        maxTokens: 100,
        userId: payload.userId,
        workflowId: payload.workflowId,
      });

      const job: FlowJob = {
        name: 'workflow-job',
        queueName: `${assistant.llm.provider}-${assistant.llm.apiName}`,
        data: jobData,
        opts: defaultJobOpts,
      };

      // ignore step 0 and stop recursion
      if (stepIndex <= 0) {
        return;
      }

      // recursive call
      const child = jobChild(stepIndex - 1, rowIndex);
      if (child) {
        // @ts-ignore
        job.children = [child];
      }

      return job;
    }

    // create for each row a job with children (children in reverse order)
    for (let i = 0; i < rowCount; i++) {
      const workflowCompletionData = {
        row: i,
        userId: payload.userId,
        workflowId: payload.workflowId,
      };

      const job: FlowJob = {
        name: 'workflow-job-row',
        queueName: 'workflow-row-completed',
        data: workflowCompletionData,
        opts: defaultJobOpts,
        children: [jobChild(startStepIndex, i)],
      };
      rows.push(job);
    }

    return rows;
  }

  async executeWorkflow(userId: string, workflowId: string) {
    if (!workflowId || !userId) {
      throw new Error(`Workflow Id or UserId missing`);
    }

    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    const { steps, id } = workflow;

    const jobs = this.getFlowRows({
      userId,
      workflowSteps: steps,
      workflowId: id,
    });

    // console.log(`Workflow: ${JSON.stringify(jobs, null, 2)}`);
    // throw new Error('Not implemented');

    try {
      const chain = await this.flowProducer.addBulk(jobs);
      return chain;
      //
    } catch (error) {
      console.error(error);
      throw new Error('Error executing workflow');
    }
  }
}
