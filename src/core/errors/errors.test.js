'use strict';
const errors = require('../constants/errors');
const httpCodes = require('../constants/http-codes');

const errorService = require('./index');

describe('core/errors', () => {
  it('should return a validation error object', () => {
    const mockError = {
      message: 'Invalid Username',
      location: 'Username',
    };

    expect(
      errorService.validationError(mockError.message, mockError.location),
    ).toEqual({
      code: errors.VALIDATION_ERROR.code,
      reason: errors.VALIDATION_ERROR.reason,
      message: mockError.message,
      location: mockError.location,
    });
  });

  it(' should return an internal server error object', () => {
    expect(errorService.internalServerError).toEqual({
      code: httpCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  });
});
