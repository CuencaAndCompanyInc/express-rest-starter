'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const errors = require('../../../core/errors');
const httpCodes = require('../../../core/constants/http-codes');

const { User } = require('./models');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password', 'emailAddress'];
  const missingField = requiredFields.find((field) => !(field in req.body));

  if (missingField) {
    const validationError = errors.validationError(
      'Missing field',
      missingField,
    );
    return res.status(validationError.code).json(validationError);
  }

  const stringFields = [
    'username',
    'password',
    'firstName',
    'lastName',
    'emailAddress',
  ];
  const nonStringField = stringFields.find(
    (field) => field in req.body && typeof req.body[field] !== 'string',
  );

  if (nonStringField) {
    const validationError = errors.validationError(
      'Incorrect field type: expected string',
      nonStringField,
    );
    return res.status(validationError.code).json(validationError);
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    (field) => req.body[field].trim() !== req.body[field],
  );

  if (nonTrimmedField) {
    const validationError = errors.validationError(
      'Cannot start or end with whitespace',
      nonTrimmedField,
    );
    return res.status(validationError.code).json(validationError);
  }

  const sizedFields = {
    username: {
      min: 1,
    },
    password: {
      min: 10,
      max: 72,
    },
    emailAddress: {
      max: 254,
    },
  };

  const tooSmallField = Object.keys(sizedFields).find(
    (field) =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min,
  );
  const tooLargeField = Object.keys(sizedFields).find(
    (field) =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max,
  );

  if (tooSmallField || tooLargeField) {
    const message = tooSmallField
      ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
      : `Must be at most ${sizedFields[tooLargeField].max} characters long`;

    const location = tooSmallField || tooLargeField;
    const validationError = errors.validationError(message, location);
    return res.status(validationError.code).json(validationError);
  }

  let {
    username,
    emailAddress,
    password,
    firstName = '',
    lastName = '',
  } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({ username })
    .count()
    .then((count) => {
      if (count > 0) {
        const validationError = errors.validationError(
          'Username already taken',
          'username',
        );
        return Promise.reject(validationError);
      }
      return User.hashPassword(password);
    })
    .then((hash) => {
      return User.create({
        username,
        password: hash,
        emailAddress,
        firstName,
        lastName,
      })
        .then((user) => {
          return res.status(httpCodes.CREATED).json(user.serialize());
        })
        .catch((err) => {
          if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
          }
          const internalServerError = errors.internalServerError();
          res.status(internalServerError.code).json(internalServerError);
        });
    });
});

module.exports = { router };
