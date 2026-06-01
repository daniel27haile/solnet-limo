'use strict';

const { success, error, created } = require('../../utils/apiResponse');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('apiResponse helpers', () => {
  describe('success()', () => {
    it('responds with 200 and success:true by default', () => {
      const res = mockRes();
      success(res, { id: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { id: 1 },
      });
    });

    it('uses custom status code and message', () => {
      const res = mockRes();
      success(res, null, 'Done', 204);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Done',
        data: null,
      });
    });

    it('defaults data to null when omitted', () => {
      const res = mockRes();
      success(res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: null })
      );
    });
  });

  describe('error()', () => {
    it('responds with 500 and success:false by default', () => {
      const res = mockRes();
      error(res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error',
      });
    });

    it('includes errors array when provided', () => {
      const res = mockRes();
      const validationErrors = [{ field: 'email', msg: 'Invalid email' }];
      error(res, 'Validation failed', 422, validationErrors);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    });

    it('omits errors key when errors is null', () => {
      const res = mockRes();
      error(res, 'Not found', 404, null);
      const payload = res.json.mock.calls[0][0];
      expect(payload).not.toHaveProperty('errors');
    });
  });

  describe('created()', () => {
    it('delegates to success() with status 201', () => {
      const res = mockRes();
      created(res, { id: 42 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created successfully',
        data: { id: 42 },
      });
    });

    it('uses custom message', () => {
      const res = mockRes();
      created(res, { id: 1 }, 'Booking created');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Booking created' })
      );
    });
  });
});
