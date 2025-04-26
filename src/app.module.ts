import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { AccountModule } from './modules/account/account.module';
import { AiModelModule } from './modules/ai-model/ai-model.module';
import { AssistantJobModule } from './modules/assistant-job/assistant-job.module';
import { AssistantTeamModule } from './modules/assistant-team/assistant-team.module';
import { AssistantTemplateModule } from './modules/assistant-template/assistant-template.module';
import { AssistantToolModule } from './modules/assistant-tool/assistant-tool.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CacheManagerModule } from './modules/cache-manager/cache-manager.module';
import { ChatMessageController } from './modules/chat-message/chat-message.controller';
import { ChatMessageModule } from './modules/chat-message/chat-message.module';
import { ChatStreamModule } from './modules/chat-stream/chat-stream.module';
import { ChatModule } from './modules/chat/chat.module';
import { CollectionAbleModule } from './modules/collection-able/collection-able.module';
import { CollectionModule } from './modules/collection/collection.module';
import { CreditModule } from './modules/credit/credit.module';
import { DatabaseModule } from './modules/database/database.module';
import { DocumentItemModule } from './modules/document-item/document-item.module';
import { DocumentModule } from './modules/document/document.module';
import { EditorModule } from './modules/editor/editor.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { GoogleDriveModule } from './modules/google-drive/google-drive.module';
import { HttpClientModule } from './modules/http-client/http-client.module';
import { LlmModule } from './modules/llm/llm.module';
import { MailModule } from './modules/mail/mail.module';
import { MediaAbleModule } from './modules/media-able/media-able.module';
import { MediaModule } from './modules/media/media.module';
import { NerModule } from './modules/ner/ner.module';
import { OnboardModule } from './modules/onboard/onboard.module';
import { PromptWizardModule } from './modules/prompt-wizard/prompt-wizard.module';
import { ProviderAuthModule } from './modules/provider-auth/provider-auth.module';
import { QueueModule } from './modules/queue/queue.module';
import { RecordModule } from './modules/record/record.module';
import { SlackModule } from './modules/slack/slack.module';
import { SocketModule } from './modules/socket/socket.module';
import { SpeechToTextModule } from './modules/speech-to-text/speech-to-text.module';
import { StorageModule } from './modules/storage/storage.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { TeamModule } from './modules/team/team.module';
import { TextToImageModule } from './modules/text-to-image/text-to-image.module';
import { TokenUsageModule } from './modules/token-usage/token-usage.module';
import { TokenizerModule } from './modules/tokenizer/tokenizer.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserFavoriteModule } from './modules/user-favorite/user-favorite.module';
import { UserModule } from './modules/user/user.module';
import { WorkflowExecutionModule } from './modules/workflow-execution/workflow-execution.module';
import { WorkflowStepModule } from './modules/workflow-step/workflow-step.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

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
    // Schedule
    ScheduleModule.forRoot(),
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
          ttl: config.get('THROTTLE_TTL', 60 * 1000),
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    // Cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          stores: [
            createKeyv({
              url: `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', 6379)}`,
              password: config.get('REDIS_PASSWORD', ''),
            }),
          ],
        };
      },
    }),
    // Mail
    MailModule.forRoot({
      isGlobal: true,
    }),

    // Slack
    SlackModule,

    // Payment
    StripeModule,

    // Auth
    AuthModule,
    // Account
    UserModule,
    AccountModule,
    // Credit
    CreditModule,
    // Chat
    ChatModule,
    ChatStreamModule,
    // Assistant
    AssistantModule,
    AssistantToolModule,
    AssistantTemplateModule,
    //

    SocketModule,

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

    WorkflowExecutionModule,

    AssistantJobModule,

    GoogleDriveModule,

    ProviderAuthModule,

    HttpClientModule,

    UserFavoriteModule,

    PromptWizardModule,

    CacheManagerModule,

    EditorModule,

    TokenUsageModule,

    AssistantTeamModule,

    NerModule,

    TeamModule,

    SpeechToTextModule,
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
    // TODO: enable throttler by uncommenting the following lines
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerBehindProxyGuard,
    // },

    // TODO: enable global timeout interceptor by uncommenting the following lines
    //  {
    //    provide: APP_INTERCEPTOR,
    //    useClass: TimeoutInterceptor,
    //  },
  ],
})
export class AppModule {
  static port: number;
  static apiPrefix: string;
  static isDev: boolean;
  static origins: string[];

  constructor(private readonly configService: ConfigService) {
    AppModule.port = +this.configService.get<number>('API_PORT', 3000);
    AppModule.apiPrefix = this.configService.get<string>('API_PREFIX', '');
    AppModule.isDev = Boolean(this.configService.get<string>('APP_ENV') === 'dev');
    AppModule.origins = this.configService
      .get<string>('CORS_ORIGINS', '*')
      .replace(/\s/g, '')
      .split(',');
  }
}
