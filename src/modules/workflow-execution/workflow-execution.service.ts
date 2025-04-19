import { WorkflowService } from '@/modules/workflow/workflow.service';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FlowJob, FlowProducer, JobsOptions } from 'bullmq';
import { AssistantJobDto } from '../assistant-job/dto/assistant-job.dto';
import { WorkflowStepWithRelations } from '../workflow-step/interfaces/workflow-step.interface';

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);

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
    workflowSteps: WorkflowStepWithRelations[];
  }): FlowJob[] {
    const stepsCount = payload.workflowSteps.length;
    const startStepIndex = stepsCount - 1;
    const rowCount = payload.workflowSteps[0].document?.documentItems.length || 0;
    const rows = [];

    const defaultJobOpts = {
      removeOnComplete: true,
      removeOnFail: true,
    } as JobsOptions;

    function jobChild(stepIndex: number, rowIndex: number): any {
      const { assistant, document, name, inputSteps } = payload.workflowSteps[stepIndex];
      const documentItem = document.documentItems[rowIndex];

      if (!assistant) {
        throw new Error(
          `Assistant not found for step ${stepIndex} with name ${payload.workflowSteps[stepIndex].name}`,
        );
      }

      const inputDocumentItemIds = inputSteps.map((inputStep: any) => {
        const inputDocument = payload.workflowSteps.find((step) => step.id === inputStep);
        if (!inputDocument) {
          return;
        }
        return inputDocument.document.documentItems[rowIndex].id;
      });

      const jobData = AssistantJobDto.fromInput({
        totalStepCount: stepsCount,
        totalRowCount: rowCount,
        stepIndex,
        rowIndex,
        stepName: name,
        llmId: assistant.llm.id,
        assistantId: assistant.id,
        assistantTools: assistant.tools.map((t) => t.tool),
        llmProvider: assistant.llm.provider,
        llmNameApi: assistant.llm.apiName,
        inputDocumentItemIds,
        documentItemId: documentItem.id,
        systemPrompt: assistant.systemPrompt,
        temperature: 0.8, // TODO: get from assistant
        maxTokens: 4000, // TODO: get from assistant
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

  // New function specifically for generating single-step jobs
  getSingleStepFlowRows(payload: {
    userId: string;
    workflowId: string;
    step: WorkflowStepWithRelations;
    allWorkflowSteps: WorkflowStepWithRelations[]; // Need all steps for context
  }): FlowJob[] {
    const { assistant, document, name, inputSteps, id: stepId } = payload.step;
    const rowCount = document?.documentItems.length || 0;
    const rows: FlowJob[] = []; // Explicitly type the array

    if (!document || rowCount === 0) {
      this.logger.warn({
        message: `Step has no document items to process.`,
        stepId: stepId,
        stepName: name,
      });
      return []; // No jobs to create if no rows
    }

    if (!assistant) {
      // Use object for error message
      throw new Error(
        JSON.stringify({
          message: `Assistant not found for step`,
          stepId: payload.step.id,
          stepName: payload.step.name,
        }),
      );
    }

    // Use a Map for faster lookup of input steps if needed often (though only needed once per row here)
    const stepsById = new Map(payload.allWorkflowSteps.map((s) => [s.id, s]));

    const defaultJobOpts: JobsOptions = {
      // Explicitly type the object
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    };

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const documentItem = document.documentItems[rowIndex]; // Already checked document exists

      // Correctly resolve input document item IDs using the full workflow steps context
      const inputDocumentItemIds = inputSteps
        .map((inputStepRef: any) => {
          // Adjust type based on actual inputSteps structure
          const inputStepId =
            typeof inputStepRef === 'string' ? inputStepRef : inputStepRef?.inputStepId;
          if (!inputStepId) return undefined;

          const inputStepDefinition = stepsById.get(inputStepId);
          const inputDocItem = inputStepDefinition?.document?.documentItems?.[rowIndex];
          if (!inputDocItem) {
            console.warn(
              `Input document item not found for step ${name}, input step ID ${inputStepId}, row index ${rowIndex}`,
            );
            return undefined;
          }
          return inputDocItem.id;
        })
        .filter((id) => id !== undefined) as string[];

      const jobData = AssistantJobDto.fromInput({
        // For single step execution, counts reflect this limited scope
        totalStepCount: 1,
        totalRowCount: rowCount,
        stepIndex: 0, // Index within this single-step execution
        rowIndex,
        stepName: name,
        llmId: assistant.llm.id,
        assistantId: assistant.id,
        assistantTools: assistant.tools.map((t) => t.tool),
        llmProvider: assistant.llm.provider,
        llmNameApi: assistant.llm.apiName,
        inputDocumentItemIds,
        documentItemId: documentItem.id,
        systemPrompt: assistant.systemPrompt,
        temperature: 0.8, // TODO: get from assistant
        maxTokens: 4000, // TODO: get from assistant
        userId: payload.userId,
        workflowId: payload.workflowId,
      });

      // Create the job for the single step for this row
      const stepJob: FlowJob = {
        name: 'workflow-job', // Consistent name
        queueName: `${assistant.llm.provider}-${assistant.llm.apiName}`,
        data: jobData,
        opts: defaultJobOpts,
      };

      // Create the wrapper 'row completed' job, making the step job its child
      // This mimics the structure from getFlowRows for consistency
      const rowCompletionJob: FlowJob = {
        name: 'workflow-job-row',
        queueName: 'workflow-row-completed',
        data: {
          // Use object type
          row: rowIndex,
          userId: payload.userId,
          workflowId: payload.workflowId,
          stepId: payload.step.id, // Add stepId for context
        },
        opts: defaultJobOpts,
        children: [stepJob], // The actual step job is the child
      };

      rows.push(rowCompletionJob);
    }

    return rows;
  }

  async executeWorkflow({ userId, workflowId }: { userId: string; workflowId: string }) {
    if (!workflowId || !userId) {
      throw new Error(`Workflow Id or UserId missing`);
    }

    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${workflowId}`);
    }
    const { steps, id } = workflow;

    const jobs = this.getFlowRows({
      userId,
      workflowSteps: steps as any, // TODO: fix types
      workflowId: id,
    });

    // console.log(`Workflow: ${JSON.stringify(jobs, null, 2)}`);
    // throw new Error('Not implemented');

    return this.flowProducer.addBulk(jobs);
  }

  async executeWorkflowStep({
    userId,
    workflowId,
    stepId,
  }: {
    userId: string;
    workflowId: string;
    stepId: string;
  }) {
    if (!workflowId || !userId || !stepId) {
      throw new Error(`Workflow Id or UserId or StepId missing`);
    }

    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${workflowId}`);
    }
    const { steps, id } = workflow;

    const step = steps.find((s) => s.id === stepId);
    if (!step) {
      throw new NotFoundException(`Workflow step not found: ${stepId}`);
    }

    const jobs = this.getSingleStepFlowRows({
      userId,
      workflowId: id,
      step: step as any, // TODO: fix types
      allWorkflowSteps: steps as any, // TODO: fix types
    });

    if (!jobs || jobs.length === 0) {
      // Log warning instead of throwing NotFoundException, as step was found but generated no jobs (e.g., no rows)
      this.logger.warn({
        message: `No jobs generated for workflow step execution`,
        stepId: stepId,
        workflowId: workflowId,
      });
      return []; // Return empty array, indicating nothing was added to the queue
    }

    // console.log(`Workflow: ${JSON.stringify(jobs, null, 2)}`);

    return this.flowProducer.addBulk(jobs);
  }
}
