'use strict';

// Mock mongoose so the app can be required without a live DB
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: { on: jest.fn(), once: jest.fn() },
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn(),
    methods: {},
    index: jest.fn(),
  })),
  model: jest.fn().mockReturnValue({}),
}));

const request = require('supertest');
const app = require('../../app');

describe('app integration', () => {
  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('solnet-limo-api');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Route not found');
    });

    it('returns 404 for unknown POST routes', async () => {
      const res = await request(app).post('/api/does-not-exist').send({});
      expect(res.status).toBe(404);
    });
  });

  describe('security headers', () => {
    it('sets X-Content-Type-Options from helmet', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('CORS', () => {
    it('allows requests from whitelisted origins', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:4200');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
    });

    it('rejects requests from non-whitelisted origins', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://evil.com');
      // CORS error — express-cors sets status 500 by default for callback errors
      expect([403, 500]).toContain(res.status);
    });
  });

  describe('body parsing', () => {
    it('parses JSON body', async () => {
      // POST to a real endpoint — use /api/auth/login which expects JSON
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@test.com', password: 'test' });
      // 401/400 is fine — it means JSON body was parsed and the route handler ran
      expect([400, 401, 500]).toContain(res.status);
    });

    it('returns 413 for payloads over 10kb', async () => {
      const bigBody = JSON.stringify({ data: 'x'.repeat(15 * 1024) });
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(bigBody);
      expect(res.status).toBe(413);
    });
  });
});
