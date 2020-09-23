'use strict';
const httpCodes = require('../http-codes');

const VALIDATION_ERROR = {
  code: httpCodes.VALIDATION_ERROR,
  reason: 'ValidationError',
};

module.exports = {
  VALIDATION_ERROR,
};
