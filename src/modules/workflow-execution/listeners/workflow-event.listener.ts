import { SocketService } from '@/modules/socket/socket.service';
import { WorkflowEvent } from '@/modules/workflow/enums/workflow-event.enum';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowExecutionEventDto } from '../dto/workflow-execution-event.dto';

@Injectable()
export class WorkflowEventListener {
  constructor(private readonly socket: SocketService) {}

  @OnEvent(WorkflowEvent.CELL_ACTIVE)
  cellActiveEvent(payload: WorkflowExecutionEventDto) {
    this.socket.emitEvent({
      room: `user:${payload.userId}`,
      event: `workflow-update:${payload.workflowId}`,
      data: { cellActive: true },
    });
  }

  @OnEvent(WorkflowEvent.CELL_COMPLETED)
  cellCompletedEvent(payload: WorkflowExecutionEventDto) {
    this.socket.emitEvent({
      room: `user:${payload.userId}`,
      event: `workflow-update:${payload.workflowId}`,
      data: { cellCompleted: true },
    });
  }

  @OnEvent(WorkflowEvent.ROW_COMPLETED)
  cellFailedEvent(payload: WorkflowExecutionEventDto) {
    this.socket.emitEvent({
      room: `user:${payload.userId}`,
      event: `workflow-update:${payload.workflowId}`,
      data: { rowCompleted: true },
    });
  }

  @OnEvent(WorkflowEvent.PROGRESS)
  progressEvent(payload: {
    userId: string;
    workflowId: string;
    progress: number;
  }) {
    this.socket.emitEvent({
      room: `user:${payload.userId}`,
      event: `workflow-update:${payload.workflowId}`,
      data: { progress: payload.progress },
    });
  }
}
