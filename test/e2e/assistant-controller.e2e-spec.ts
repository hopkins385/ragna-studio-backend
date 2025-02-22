import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { LargeLangModelFrontend } from '@/modules/llm/dto/llm-list-response.dto';
import { randomCUID2 } from '@/common/utils/random-cuid2';

describe('AssistantController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let configService: ConfigService;
  let sessionUser: UserEntity;
  let llms: LargeLangModelFrontend[];
  let assistantId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = moduleFixture.get<ConfigService>(ConfigService);

    await app.init();

    // Retrieve tester credentials from .env file
    const testerEmail = configService.get<string>('TESTER_EMAIL');
    const testerPassword = configService.get<string>('TESTER_PASSWORD');

    // Authenticate and get the access token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testerEmail, password: testerPassword })
      .expect(HttpStatus.CREATED);

    authToken = response.body.accessToken;

    // Account User
    const accountUser = await request(app.getHttpServer())
      .get('/account')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    expect(accountUser.body).toHaveProperty('id');
    sessionUser = accountUser.body;

    // Get available LLMs
    const llmResponse = await request(app.getHttpServer())
      .get('/llm/models')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    llms = llmResponse.body.llms;
    expect(Array.isArray(llms)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/assistant (POST)', async () => {
    const createAssistantDto = {
      teamId: sessionUser.firstTeamId,
      llmId: llms?.[0].id,
      title: 'Test Assistant',
      description: 'This is a test assistant',
      systemPrompt: 'Test prompt',
      isShared: true,
      tools: [],
    };

    const response = await request(app.getHttpServer())
      .post('/assistant')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createAssistantDto)
      .expect(HttpStatus.CREATED);

    assistantId = response.body.id;

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toEqual(createAssistantDto.title);
  });

  it('/assistant (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/assistant')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('assistants');
    expect(Array.isArray(response.body.assistants)).toBe(true);
  });

  it('/assistant/:id (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/assistant/${assistantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('assistant');
    expect(response.body.assistant.id).toEqual(assistantId);
  });

  it('/assistant/:id (PATCH)', async () => {
    const updateAssistantDto = {
      teamId: sessionUser.firstTeamId,
      llmId: llms?.[0].id,
      title: 'Updated Assistant',
      description: 'This is an updated assistant',
      systemPrompt: 'Updated prompt',
      isShared: true,
      hasKnowledgeBase: true,
      hasWorkflow: true,
      tools: [],
    };

    const response = await request(app.getHttpServer())
      .patch(`/assistant/${assistantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateAssistantDto)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toEqual(updateAssistantDto.title);

    // Verify the assistant was updated
    const getResponse = await request(app.getHttpServer())
      .get(`/assistant/${assistantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    expect(getResponse.body.assistant.title).toEqual(updateAssistantDto.title);
    expect(getResponse.body.assistant.description).toEqual(
      updateAssistantDto.description,
    );
  });

  it('/assistant/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/assistant/${assistantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`/assistant/${assistantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('returns 404 not found for non-existing assistant', async () => {
    const id = randomCUID2();
    await request(app.getHttpServer())
      .get(`/assistant/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('returns 404 not found for non-existing assistant on update', async () => {
    const id = randomCUID2();
    const updateAssistantDto = {
      teamId: sessionUser.firstTeamId,
      llmId: llms?.[0].id,
      title: 'Updated Assistant',
      description: 'This is an updated assistant',
      systemPrompt: 'Updated prompt',
      isShared: true,
      hasKnowledgeBase: true,
      hasWorkflow: true,
      tools: [],
    };
    await request(app.getHttpServer())
      .patch(`/assistant/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateAssistantDto)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('returns 404 not found for non-existing assistant on delete', async () => {
    const id = randomCUID2();
    await request(app.getHttpServer())
      .delete(`/assistant/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('returns 404 not found for invalid deleteAssistantDto', async () => {
    const invalidDeleteAssistantDto = {
      teamId: 'invalid-id',
    };
    await request(app.getHttpServer())
      .delete(`/assistant/${assistantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidDeleteAssistantDto)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('returns 400 bad request for invalid createAssistantDto', async () => {
    const invalidCreateAssistantDto = {
      teamId: 'invalid-id',
      llmId: 'invalid-id',
      title: '',
      description: '',
      systemPrompt: '',
      isShared: true,
      tools: [],
    };

    await request(app.getHttpServer())
      .post('/assistant')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidCreateAssistantDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('returns 400 bad request for invalid updateAssistantDto', async () => {
    const invalidUpdateAssistantDto = {
      teamId: 'invalid-id',
      llmId: 'invalid-id',
      title: '',
      description: '',
      systemPrompt: '',
      isShared: true,
      hasKnowledgeBase: true,
      hasWorkflow: true,
      tools: [],
    };

    await request(app.getHttpServer())
      .patch(`/assistant/${assistantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidUpdateAssistantDto)
      .expect(HttpStatus.BAD_REQUEST);
  });
});
