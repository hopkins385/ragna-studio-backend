import { WorkflowStepRepository } from './repositories/workflow-step.repository';
import { Module } from '@nestjs/common';
import { WorkflowStepService } from './workflow-step.service';
import { WorkflowStepController } from './workflow-step.controller';
import { DocumentModule } from '@/modules/document/document.module';
import { DocumentItemModule } from '@/modules/document-item/document-item.module';

@Module({
  imports: [DocumentModule, DocumentItemModule],
  controllers: [WorkflowStepController],
  providers: [WorkflowStepRepository, WorkflowStepService],
  exports: [WorkflowStepService],
})
export class WorkflowStepModule {}
