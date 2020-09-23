# Express REST Starter

This project starter includes everything you need to get up and running
with a quick REST backend.

## Features

- MongoDB
- local Authentication and JWT Authentication
- REST api is documented with Swagger (json format)
- pre-commit/pre-push hooks for testing
- Code coverage and testing through Jest and Supertest
- Travis CI integration
- Heroku integration

> setup your .env with your local dev environment.  
> for production setup environment variables in travis and heroku

## Installation

1. `npm install`
2. copy `.env.example` to `.env` and set your environment variables:

- `DATABASE_URL`, `TEST_DATABASE_URL`: mongodb urls
- `PORT`: defaults to `8080`
- `JWT_SECRET`: defaults to `S3cr3t!`
- `JWT_EXPIRY`: defaults to `7d`

3. Update `.travis.yml`
4. Add your models, routes and secure your endpoint
   by passing `jwtAuth` middleware

### Travis CI, Heroku setup

1. sign up for an account at the [TravisCI](https://travis-ci.org/) website
2. login to Travis and go to your account [repositories page](https://travis-ci.org/account/repositories)
   and switch your repo to 'on'
3. install [Travis CI CLI](https://github.com/travis-ci/travis.rb)
   and install [Heroku CLI](https://heroku.com)
4. Login and integrate with Heroku by running `travis login` and supply github username/password
5. run `travis setup heroku`
6. run `heroku create`
7. after your changes run `git push heroku master`
8. run `heroku ps:scale web=1` to startup dyno on server

## Package.json Scripts and Usage

- `start`: default command which calls `npm run prod`
- `prod`: starts server with prod configurations
- `dev`: starts server using nodemon which watches files for updates and reloads
- `test`: runs all unit tests with code coverage using jest
