import { App } from '../app';
import { closetDB } from '../models/index';
import request from 'supertest';

describe('Basic behavior of the App', () => {
  let server: App;

  beforeAll(async () => {
    server = new App();
    await server.startServer('mongodb://localhost:27017/bunkeyDB-test');
  });

  afterAll(async () => {
    server.serverApp.close();
    await closetDB();
  });

  describe('should get user request work correctly', () => {
    let result: any;
    beforeAll(async () => {
      result = await request(server.app).get('/user').send();
    });

    test('Expected 200', async () => {
      expect(result.status).toBe(200);
    });

    test('Should get users array', async () => {
      expect(result.body.data).toBeInstanceOf(Array);
      expect(result.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
