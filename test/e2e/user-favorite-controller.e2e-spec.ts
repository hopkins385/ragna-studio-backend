import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { randomCUID2 } from '@/common/utils/random-cuid2';
import { AppModule } from '@/app.module';

describe('UserFavortiteController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let authUser: UserEntity;
  let configService: ConfigService;
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

    // Auth User
    const accountUser = await request(app.getHttpServer())
      .get('/account')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    expect(accountUser.body).toHaveProperty('id');
    authUser = accountUser.body;

    // Get the first assistantistant
    const assistantsResponse = await request(app.getHttpServer())
      .get('/assistant')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    expect(assistantsResponse.body).toHaveProperty('assistants');
    assistantId = assistantsResponse.body.assistants[0].id;
  });

  afterEach(async () => {
    // logout user
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    await app.close();
  });

  it('/user-favorite (POST)', async () => {
    const createFavoriteDto = {
      favoriteId: assistantId,
      favoriteType: 'assistant',
    };

    const response = await request(app.getHttpServer())
      .post('/user-favorite')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createFavoriteDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('favorite');
    expect(response.body.favorite).toHaveProperty('id');
  });

  it('/user-favorite (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/user-favorite')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('favorites');
    expect(Array.isArray(response.body.favorites)).toBe(true);
  });

  it('/user-favorite/type/:favoriteType (GET)', async () => {
    const favoriteType = 'assistant';
    const favoriteId = assistantId;

    await request(app.getHttpServer())
      .post('/user-favorite')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ favoriteId, favoriteType })
      .expect(HttpStatus.CREATED);

    const response = await request(app.getHttpServer())
      .get(`/user-favorite/type/${favoriteType}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('favorites');
    expect(Array.isArray(response.body.favorites)).toBe(true);
  });

  it('/user-favorite/:id (DELETE)', async () => {
    const response = await request(app.getHttpServer())
      .post('/user-favorite')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ favoriteId: assistantId, favoriteType: 'assistant' })
      .expect(HttpStatus.CREATED);

    const favoriteId = response.body.favorite.id;
    const favoriteType = 'assistant';

    await request(app.getHttpServer())
      .delete(`/user-favorite/${favoriteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ favoriteType })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`/user-favorite/detail/${favoriteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('returns 404 not found for non-existing favorite', async () => {
    const id = randomCUID2();
    await request(app.getHttpServer())
      .get(`/user-favorite/detail/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('returns 400 bad request for invalid createFavoriteDto', async () => {
    const invalidCreateFavoriteDto = {
      favoriteId: '',
      favoriteType: '',
    };

    await request(app.getHttpServer())
      .post('/user-favorite')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidCreateFavoriteDto)
      .expect(HttpStatus.BAD_REQUEST);
  });
});
