'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const passport = require('passport');
const helmet = require('helmet');
const morgan = require('morgan');

const { PORT, DATABASE_URL } = require('./core/config/app');
const dbOptions = require('./core/config/db');

const { router: usersRouter } = require('./routes/users/v1');
const {
  router: authRouter,
  localStrategy,
  jwtStrategy,
} = require('./routes/auth/v1');

const swaggerDocs = require('../swagger.json');

mongoose.Promise = global.Promise;

const app = express();

app.use(morgan('combined'));
app.use(helmet());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/api/v1/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'Hello, World!',
  });
});

app.get('/api/v1/health', (req, res) => {
  res.send('OK');
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(database = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(database, dbOptions, (err) => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', (err) => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch((err) => console.error(err));
}

module.exports = { app, runServer, closeServer };
