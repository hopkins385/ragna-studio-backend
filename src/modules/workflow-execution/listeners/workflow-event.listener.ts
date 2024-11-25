import { SocketService } from '@/modules/socket/socket.service';
import { WorkflowEvent } from '@/modules/workflow/enums/workflow-event.enum';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowExecutionEventDto } from '../dto/workflow-execution-event.dto';

@Injectable()
export class WorkflowEventListener {
  constructor(private readonly socket: SocketService) {}

  @OnEvent(WorkflowEvent.CELL_ACTIVE)
  cellActiveEvent(data: WorkflowExecutionEventDto) {
    this.socket.emitEvent({
      room: `user:${data.userId}`,
      event: `workflow-update:${data.workflowId}`,
      data,
    });
  }

  @OnEvent(WorkflowEvent.CELL_COMPLETED)
  cellCompletedEvent(data: WorkflowExecutionEventDto) {
    this.socket.emitEvent({
      room: `user:${data.userId}`,
      event: `workflow-update:${data.workflowId}`,
      data,
    });
  }

  @OnEvent(WorkflowEvent.ROW_COMPLETED)
  cellFailedEvent(data: WorkflowExecutionEventDto) {
    this.socket.emitEvent({
      room: `user:${data.userId}`,
      event: `workflow-update:${data.workflowId}`,
      data,
    });
  }
}
