'use strict';
const errors = require('../constants/errors');
const httpCodes = require('../constants/http-codes');

const validationError = (message, location) => ({
  code: errors.VALIDATION_ERROR.code,
  reason: errors.VALIDATION_ERROR.reason,
  message,
  location,
});

const internalServerError = {
  code: httpCodes.INTERNAL_SERVER_ERROR,
  message: 'Internal Server Error',
};

module.exports = {
  validationError,
  internalServerError,
};
