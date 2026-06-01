'use strict';

// env is already mocked in jest.setup.js
const errorMiddleware = require('../../middleware/error.middleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('error.middleware', () => {
  let req, next;

  beforeEach(() => {
    req = {};
    next = jest.fn();
  });

  it('returns 500 for a generic error', () => {
    const res = mockRes();
    errorMiddleware(new Error('Something went wrong'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Something went wrong' })
    );
  });

  it('uses err.statusCode when present', () => {
    const res = mockRes();
    const err = new Error('Not allowed');
    err.statusCode = 403;
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('handles Mongoose ValidationError with 400', () => {
    const res = mockRes();
    const err = {
      name: 'ValidationError',
      errors: {
        email: { message: 'Email is required' },
        phone: { message: 'Phone is invalid' },
      },
    };
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toContain('Email is required');
    expect(body.message).toContain('Phone is invalid');
  });

  it('handles Mongoose duplicate key error (code 11000) with 400', () => {
    const res = mockRes();
    const err = {
      code: 11000,
      keyValue: { email: 'test@test.com' },
    };
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('Email already exists');
  });

  it('capitalizes the duplicate key field name', () => {
    const res = mockRes();
    const err = { code: 11000, keyValue: { username: 'john' } };
    errorMiddleware(err, req, res, next);
    expect(res.json.mock.calls[0][0].message).toBe('Username already exists');
  });

  it('handles Mongoose CastError with 404', () => {
    const res = mockRes();
    const err = { name: 'CastError', message: 'Cast to ObjectId failed' };
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0].message).toBe('Resource not found');
  });

  it('handles JsonWebTokenError with 401', () => {
    const res = mockRes();
    const err = { name: 'JsonWebTokenError', message: 'jwt malformed' };
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe('Invalid token');
  });

  it('handles TokenExpiredError with 401', () => {
    const res = mockRes();
    const err = { name: 'TokenExpiredError', message: 'jwt expired' };
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe('Token expired');
  });

  it('does not include stack trace in test/production mode', () => {
    const res = mockRes();
    errorMiddleware(new Error('oops'), req, res, next);
    const body = res.json.mock.calls[0][0];
    expect(body).not.toHaveProperty('stack');
  });

  it('always responds with success:false', () => {
    const res = mockRes();
    errorMiddleware(new Error('test'), req, res, next);
    expect(res.json.mock.calls[0][0].success).toBe(false);
  });
});
