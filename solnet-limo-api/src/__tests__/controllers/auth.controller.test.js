'use strict';

jest.mock('../../models/AdminUser');
jest.mock('jsonwebtoken');

const AdminUser = require('../../models/AdminUser');
const jwt = require('jsonwebtoken');

// Require controller after mocks are in place
const authController = require('../../controllers/auth.controller');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockAdmin = {
  _id: 'admin-id-123',
  name: 'Test Admin',
  email: 'admin@solnetlimo.com',
  role: 'admin',
  comparePassword: jest.fn(),
};

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('login()', () => {
    it('returns 400 when email is missing', async () => {
      const res = mockRes();
      const req = { body: { password: 'pass123' } };
      const next = jest.fn();

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Email and password are required' })
      );
    });

    it('returns 400 when password is missing', async () => {
      const res = mockRes();
      await authController.login({ body: { email: 'admin@test.com' } }, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 401 when admin is not found', async () => {
      const res = mockRes();
      AdminUser.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await authController.login(
        { body: { email: 'noone@test.com', password: 'wrong' } },
        res,
        jest.fn()
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json.mock.calls[0][0].message).toBe('Invalid credentials');
    });

    it('returns 401 when password does not match', async () => {
      const res = mockRes();
      mockAdmin.comparePassword.mockResolvedValue(false);
      AdminUser.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });

      await authController.login(
        { body: { email: 'admin@solnetlimo.com', password: 'wrongpass' } },
        res,
        jest.fn()
      );

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 200 with token and admin data on success', async () => {
      const res = mockRes();
      mockAdmin.comparePassword.mockResolvedValue(true);
      AdminUser.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });
      jwt.sign = jest.fn().mockReturnValue('mocked.jwt.token');

      await authController.login(
        { body: { email: 'admin@solnetlimo.com', password: 'correct' } },
        res,
        jest.fn()
      );

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body.data.token).toBe('mocked.jwt.token');
      expect(body.data.admin.email).toBe('admin@solnetlimo.com');
    });

    it('calls next(err) on unexpected error', async () => {
      const next = jest.fn();
      AdminUser.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB connection lost')),
      });

      await authController.login(
        { body: { email: 'a@b.com', password: 'pass' } },
        mockRes(),
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getMe()', () => {
    it('returns 200 with the authenticated admin info', async () => {
      const res = mockRes();
      const req = {
        admin: { _id: 'id-1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
      };

      await authController.getMe(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body.data.email).toBe('admin@test.com');
    });
  });
});
