const assert = require('node:assert/strict');
const test = require('node:test');
const createApiTokenMiddleware = require('../middleware/requireApiToken');

const invokeMiddleware = (authorization, token = 'correct-secret') => {
  let statusCode;
  let responseBody;
  let nextCalled = false;
  const req = {
    get: () => authorization
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  createApiTokenMiddleware(token)(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, responseBody, nextCalled };
};

test('rejects a request without a bearer token', () => {
  assert.deepEqual(invokeMiddleware(undefined), {
    statusCode: 401,
    responseBody: { message: 'Authentication required' },
    nextCalled: false
  });
});

test('rejects an incorrect bearer token', () => {
  assert.deepEqual(invokeMiddleware('Bearer incorrect-secret'), {
    statusCode: 401,
    responseBody: { message: 'Invalid authentication token' },
    nextCalled: false
  });
});

test('accepts a matching bearer token', () => {
  assert.deepEqual(invokeMiddleware('Bearer correct-secret'), {
    statusCode: undefined,
    responseBody: undefined,
    nextCalled: true
  });
});
