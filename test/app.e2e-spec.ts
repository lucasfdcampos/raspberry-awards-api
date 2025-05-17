import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/movie (GET) should return all movies', async () => {
    const response = await request(app.getHttpServer()).get('/movie');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/awards/intervals (GET) shoudl return min and max award intervals', async () => {
    const response = await request(app.getHttpServer()).get(
      '/awards/intervals',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('min');
    expect(response.body).toHaveProperty('max');
  });

  describe('GET /awards/intervals', () => {
    it('should return the correct producers with min and max intervals', async () => {
      const response = await request(app.getHttpServer()).get(
        '/awards/intervals',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        min: [
          {
            producer: 'Joel Silver',
            interval: 1,
            previousWin: 1990,
            followingWin: 1991,
          },
        ],
        max: [
          {
            producer: 'Matthew Vaughn',
            interval: 13,
            previousWin: 2002,
            followingWin: 2015,
          },
        ],
      });
    });
  });
});
