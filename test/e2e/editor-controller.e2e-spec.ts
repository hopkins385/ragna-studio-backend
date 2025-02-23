import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { AppModule } from '@/app.module';
import { EditorService } from '@/modules/editor/editor.service';

describe('EditorController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let authUser: UserEntity;
  let configService: ConfigService;
  let editorService: EditorService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EditorService)
      .useValue({
        completion: jest.fn().mockResolvedValue({ completion: 'mocked completion' }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configService = moduleFixture.get<ConfigService>(ConfigService);
    editorService = moduleFixture.get<EditorService>(EditorService);

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

    // Auth User
    const accountUser = await request(app.getHttpServer())
      .get('/account')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    expect(accountUser.body).toHaveProperty('id');
    authUser = accountUser.body;
  });

  afterEach(async () => {
    // logout user
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    await app.close();
  });

  it('/editor/completion (POST)', async () => {
    const editorCompletionBody = {
      prompt: 'Test prompt',
      selectedText: 'Test selected text',
      context: 'Test context',
    };

    const response = await request(app.getHttpServer())
      .post('/editor/completion')
      .set('Authorization', `Bearer ${authToken}`)
      .send(editorCompletionBody)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('completion');
    expect(response.body.completion).toEqual('mocked completion');
  });

  it('returns 400 bad request for invalid editorCompletionBody', async () => {
    const invalidEditorCompletionBody = {
      prompt: '   ',
      selectedText: 'some',
      context: 'some',
    };

    await request(app.getHttpServer())
      .post('/editor/completion')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidEditorCompletionBody)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('returns 400 bad request for non string editorCompletionBody', async () => {
    const invalidEditorCompletionBody = {
      prompt: 123,
      selectedText: 123,
      context: 123,
    };

    await request(app.getHttpServer())
      .post('/editor/completion')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidEditorCompletionBody)
      .expect(HttpStatus.BAD_REQUEST);
  });
});
