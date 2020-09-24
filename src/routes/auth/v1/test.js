'use strict';
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../../../server');
const { User } = require('../../users/v1');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../../../core/config/app');

describe('src/core/auth', () => {
  let mockUser;
  const loginUrl = '/api/v1/auth/login';
  const refreshUrl = '/api/v1/auth/refresh';

  beforeAll(function () {
    return runServer(TEST_DATABASE_URL);
  });

  afterAll(function () {
    return closeServer();
  });

  beforeEach(function () {
    mockUser = {
      username: 'testUser',
      emailAddress: 'test@example.com',
      password: 'example*Password123',
      firstName: 'Test',
      lastName: 'User',
    };
    return User.hashPassword(mockUser.password).then((password) => {
      User.create({
        ...mockUser,
        password,
      });
    });
  });

  afterEach(function () {
    return User.deleteMany({});
  });

  describe('/api/v1/auth/login', () => {
    it('Should reject requests with no credentials', async () => {
      let result = await request(app).post(loginUrl);

      expect(result.statusCode).toBe(400);
    });

    it('should reject requests with incorrect usernames', async () => {
      mockUser.username = 'wrongUsername';

      let result = await request(app).post(loginUrl).send(mockUser);
      expect(result.statusCode).toBe(401);
    });

    it('should reject requests with incorrect password', async () => {
      mockUser.password = 'wrongPassword789';

      let result = await request(app).post(loginUrl).send(mockUser);
      expect(result.statusCode).toBe(401);
    });

    it('should return a valid auth token', async () => {
      const { username, password, firstName, lastName } = mockUser;

      let result = await request(app).post(loginUrl).send({ username, password });
      expect(result.statusCode).toBe(200);
      expect(result.body).toBeInstanceOf(Object);
      const authToken = result.body.authToken;
      expect(authToken).toBeTruthy();
      const payload = jwt.verify(authToken, JWT_SECRET, {
        algorithm: ['HS256'],
      });
      expect(payload.user).toMatchObject({
        username,
        firstName,
        lastName,
      });
    });
  });

  describe('/api/v1/auth/refresh', () => {
    it('should reject requests with no credentials', async () => {
      let result = await request(app).post(refreshUrl);
      expect(result.statusCode).toBe(401);
    });

    it('should reject requests with an invalid token', async () => {
      const { username, firstName, lastName } = mockUser;

      const token = jwt.sign(
        {
          username,
          firstName,
          lastName,
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d',
        },
      );

      let result = await request(app)
        .post(refreshUrl)
        .set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(401);
    });

    it('it should reject requests with an expires token', async () => {
      const { username, firstName, lastName } = mockUser;

      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName,
          },
          exp: Math.floor(Date.now() / 1000) - 10,
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
        },
      );

      let result = await request(app)
        .post(refreshUrl)
        .set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(401);
    });

    it('should return a valid auth token with a newer expiry date', async () => {
      const { username, firstName, lastName } = mockUser;

      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName,
          },
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d',
        },
      );

      const decodedToken = jwt.decode(token);

      let result = await request(app)
        .post(refreshUrl)
        .set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBeInstanceOf(Object);
      const tokenFromBody = result.body.authToken;
      const payload = jwt.verify(token, JWT_SECRET, { algorithm: ['HS256'] });
      expect(payload.user).toMatchObject({
        username,
        firstName,
        lastName,
      });
      expect(payload.exp).toBeGreaterThanOrEqual(decodedToken.exp);
    });
  });
});
