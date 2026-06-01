'use strict';

const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler', () => {
  it('calls the wrapped function with req, res, next', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const handler = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await handler(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next(err) when the wrapped function rejects', async () => {
    const err = new Error('async failure');
    const fn = jest.fn().mockRejectedValue(err);
    const handler = asyncHandler(fn);
    const next = jest.fn();

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it('calls next(err) when the wrapped function throws synchronously', async () => {
    const err = new Error('sync throw');
    const fn = jest.fn(() => { throw err; });
    const handler = asyncHandler(fn);
    const next = jest.fn();

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it('returns a Promise from the handler (awaitable)', () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const handler = asyncHandler(fn);
    const result = handler({}, {}, jest.fn());
    expect(result).toBeInstanceOf(Promise);
  });

  it('returns a function (middleware signature)', () => {
    const handler = asyncHandler(jest.fn());
    expect(typeof handler).toBe('function');
    expect(handler.length).toBe(3);
  });
});
