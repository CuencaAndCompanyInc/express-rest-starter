'user strict';
const request = require('supertest');
const faker = require('faker');

const { app, runServer, closeServer } = require('../../../server');
const { User } = require('./index');
const { TEST_DATABASE_URL } = require('../../../core/config/app');

describe('routes/users', () => {
  const url = '/api/v1/users';
  let mockUser;

  beforeAll(function () {
    return runServer(TEST_DATABASE_URL);
  });

  afterAll(function () {
    return closeServer();
  });

  beforeEach(function () {
    mockUser = {
      username: faker.internet.userName(),
      emailAddress: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
  });

  afterEach(function () {
    return User.deleteMany({});
  });

  describe(url, function () {
    describe('POST', function () {
      it('Should reject users with missing field', async function () {
        delete mockUser.username;

        const result = await request(app).post(url).send(mockUser);
        expect(result.statusCode).toEqual(422);
        expect(result.body.reason).toEqual('ValidationError');
        expect(result.body.message).toEqual('Missing field');
        expect(result.body.location).toEqual('username');
      });

      it('should reject users with non-string fields', async () => {
        mockUser.username = 123;
        const result = await request(app).post(url).send(mockUser);
        expect(result.statusCode).toEqual(422);
        expect(result.body.reason).toEqual('ValidationError');
        expect(result.body.message).toEqual(
          'Incorrect field type: expected string',
        );
        expect(result.body.location).toEqual('username');
      });

      it('should reject users with non-trimmed fields', async () => {
        mockUser.username = '  david  ';
        const result = await request(app).post(url).send(mockUser);
        expect(result.statusCode).toEqual(422);
        expect(result.body.reason).toEqual('ValidationError');
        expect(result.body.message).toEqual('Cannot start or end with whitespace');
        expect(result.body.location).toEqual('username');
      });

      it('should reject users with fields which do not meet minimum length', async () => {
        mockUser.password = '123';

        const result = await request(app).post(url).send(mockUser);

        expect(result.statusCode).toEqual(422);
        expect(result.body.reason).toEqual('ValidationError');
        expect(result.body.message).toEqual('Must be at least 10 characters long');
        expect(result.body.location).toEqual('password');
      });

      it('should reject users with fields which exceed maximum length', async () => {
        mockUser.password =
          'abcdefghijklmnopqrstuvwxyz1234567890' +
          'abcdefghijklmnopqrstuvwxyz1234567890' +
          'abcdefghijklmnopqrstuvwxyz1234567890' +
          'abcdefghijklmnopqrstuvwxyz1234567890';

        const result = await request(app).post(url).send(mockUser);

        expect(result.statusCode).toEqual(422);
        expect(result.body.reason).toEqual('ValidationError');
        expect(result.body.message).toEqual('Must be at most 72 characters long');
        expect(result.body.location).toEqual('password');
      });

      it('should create a new user when valid information is sent', async () => {
        const { username, firstName, lastName } = mockUser;
        const result = await request(app).post(url).send(mockUser);
        expect(result.statusCode).toBe(201);
        expect(result.body).toMatchObject({
          username,
          firstName,
          lastName,
        });
      });
    });
  });
});
