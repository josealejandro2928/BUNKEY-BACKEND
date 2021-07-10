import { App } from '../app';
import { closetDB } from '../models/index';
import request from 'supertest';
import { Buffer } from 'buffer';
import { constants } from 'perf_hooks';

describe('Testing auth endpoint', () => {
  let server: App;
  const credentials = { user: 'admin@localhost.com', password: 'admin' };

  beforeAll(async () => {
    server = new App();
    await server.startServer('mongodb://localhost:27017/bunkeyDB-test');
  });

  afterAll(async () => {
    server.serverApp.close();
    await closetDB();
  });

  test('It is expected to be well logged in', async () => {
    const basicTokent = Buffer.from(
      `${credentials.user}:${credentials.password}`
    ).toString('base64');
    const result = await request(server.app)
      .get('/auth/login')
      .set('Authorization', `Basic ${basicTokent}`)
      .send();
    expect(result.status).toBe(200);
    expect(result.body.profile).toBeTruthy();
    expect(result.body.token).toBeTruthy();
  });

  test('It is expected to get Invalid password', async () => {
    const basicTokent = Buffer.from(
      `${credentials.user}:some bad password`
    ).toString('base64');
    const result = await request(server.app)
      .get('/auth/login')
      .set('Authorization', `Basic ${basicTokent}`)
      .send();
    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Invalid password');
  });

  test('It is expected to get User not found', async () => {
    const basicTokent = Buffer.from(
      `some bad user:${credentials.password}`
    ).toString('base64');
    const result = await request(server.app)
      .get('/auth/login')
      .set('Authorization', `Basic ${basicTokent}`)
      .send();
    expect(result.status).toBe(401);
    expect(result.body.message).toBe('The mail does not exist');
  });

  test('It is expected to get an error, the authorization value is required', async () => {
    const result = await request(server.app).get('/auth/login').send();
    expect(result.status).toBe(401);
    expect(result.body.message).toBe('You must past an authorization header');
  });

  test('It is expected to get an error, invalid reqquest', async () => {
    const basicTokent = Buffer.from(
      `some bad user:${credentials.password}`
    ).toString('utf8');
    const result = await request(server.app)
      .get('/auth/login')
      .set('Authorization', `Basic ${basicTokent}`)
      .send();
    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Invalid request');
  });
});
