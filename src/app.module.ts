import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CsrfModule } from './modules/csrf/csrf.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AccountModule } from './modules/account/account.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChatModule } from './modules/chat/chat.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { DatabaseModule } from './modules/database/database.module';
import { QueueModule } from './modules/queue/queue.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { SocketModule } from './modules/socket/socket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatToolModule } from './modules/chat-tool/chat-tool.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { AssistantToolModule } from './modules/assistant-tool/assistant-tool.module';
import { ChatStreamModule } from './modules/chat-stream/chat-stream.module';
import { CreditModule } from './modules/credit/credit.module';
import { TokenizerModule } from './modules/tokenizer/tokenizer.module';
import { AiModelModule } from './modules/ai-model/ai-model.module';
import { ChatMessageController } from './modules/chat-message/chat-message.controller';
import { ChatMessageModule } from './modules/chat-message/chat-message.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { LlmModule } from './modules/llm/llm.module';
import { CollectionModule } from './modules/collection/collection.module';
import { CollectionAbleModule } from './modules/collection-able/collection-able.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { UploadModule } from './modules/upload/upload.module';
import { StorageModule } from './modules/storage/storage.module';
import { MediaModule } from './modules/media/media.module';
import { MediaAbleModule } from './modules/media-able/media-able.module';
import { RecordModule } from './modules/record/record.module';
import { TextToImageModule } from './modules/text-to-image/text-to-image.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { WorkflowStepModule } from './modules/workflow-step/workflow-step.module';
import { DocumentModule } from './modules/document/document.module';
import { DocumentItemModule } from './modules/document-item/document-item.module';
import { OnboardModule } from './modules/onboard/onboard.module';
import { WorkflowExecutionModule } from './modules/workflow-execution/workflow-execution.module';
import { AudioModule } from './modules/audio/audio.module';
import { AssistantJobModule } from './modules/assistant-job/assistant-job.module';
import { GoogleDriveModule } from './modules/google-drive/google-drive.module';
import { ProviderAuthModule } from './modules/provider-auth/provider-auth.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env'],
      load: [],
    }),
    // Database
    DatabaseModule,
    // EventEmitter
    EventEmitterModule.forRoot(),
    // Queue
    QueueModule,
    // Throttler
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60),
          limit: config.get('THROTTLE_LIMIT', 10),
        },
      ],
    }),
    // Payment
    StripeModule,

    // Auth
    AuthModule,
    CsrfModule,
    // Account
    UserModule,
    AccountModule,
    // Chat
    ChatModule,
    ChatToolModule,
    ChatStreamModule,
    // Assistant
    AssistantModule,
    AssistantToolModule,
    //

    SocketModule,

    CreditModule,

    TokenizerModule,

    AiModelModule,

    ChatMessageModule,

    LlmModule,

    CollectionModule,

    CollectionAbleModule,

    EmbeddingModule,

    UploadModule,

    StorageModule,

    MediaModule,

    MediaAbleModule,

    RecordModule,

    TextToImageModule,

    WorkflowModule,

    WorkflowStepModule,

    DocumentModule,

    DocumentItemModule,

    OnboardModule,

    AudioModule,

    WorkflowExecutionModule,

    AssistantJobModule,

    GoogleDriveModule,

    ProviderAuthModule,
    // ,
  ],
  controllers: [ChatMessageController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: ThrottlerBehindProxyGuard,
  //   },
  // ],
})
export class AppModule {
  static port: number;
  static apiPrefix: string;
  static isDev: boolean;
  static origins: string[];

  constructor(private readonly configService: ConfigService) {
    AppModule.port = +this.configService.get<number>('API_PORT', 3000);
    AppModule.apiPrefix = this.configService.get<string>('API_PREFIX', '');
    AppModule.isDev = this.configService.get<string>('APP_ENV') === 'dev';
    AppModule.origins = this.configService
      .get<string>('CORS_ORIGINS', '*')
      .replace(/\s/g, '')
      .split(',');
  }
}
