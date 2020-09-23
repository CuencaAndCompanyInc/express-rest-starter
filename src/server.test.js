'user strict';
const request = require('supertest');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('./server');
const { User } = require('./routes/users/v1/models');
const { TEST_DATABASE_URL, JWT_SECRET } = require('./core/config/app');

describe('Server.js', () => {
  let mockUser;

  beforeAll(function () {
    return runServer(TEST_DATABASE_URL);
  });

  afterAll(function () {
    return closeServer();
  });

  beforeEach(async function () {
    mockUser = {
      username: faker.internet.userName(),
      emailAddress: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
   return await request(app).post('/api/v1/user').send(mockUser);
  });

  afterEach(function () {
    return User.deleteMany({});
  });

  describe('/api/v1/health', () => {
    it('should return health status of 200', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('/api/v1/protected', () => {
    const protectedUrl = '/api/v1/protected'
    it('should return 401 ', async () => {
      const result = await request(app).get(protectedUrl);
      expect(result.statusCode).toEqual(401);
    });

    it('should return protected data when authToken is provided', async () => {
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

      const result = await request(app).get(protectedUrl)
          .set('Authorization', `Bearer ${token}`);
      expect(result.statusCode).toBe(200);
      expect(result.body.data).toBe('Hello, World!');
    });
  });
});
