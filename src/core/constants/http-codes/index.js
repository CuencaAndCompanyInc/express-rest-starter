'use strict';

const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const FORBIDDEN = 403;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const NOT_ALLOWED = 405;
const VALIDATION_ERROR = 422;
const RATE_LIMIT = 429;
const INTERNAL_SERVER_ERROR = 500;

module.exports = {
  OK,
  CREATED,
  NO_CONTENT,
  FORBIDDEN,
  UNAUTHORIZED,
  NOT_FOUND,
  NOT_ALLOWED,
  VALIDATION_ERROR,
  RATE_LIMIT,
  INTERNAL_SERVER_ERROR,
};
