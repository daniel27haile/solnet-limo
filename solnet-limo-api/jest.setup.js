'use strict';

// Suppress dotenv and console output during tests
jest.mock('./src/config/env', () => ({
  PORT: 5000,
  NODE_ENV: 'test',
  JWT_SECRET: 'test-jwt-secret-for-testing-only',
  MONGO_URI: 'mongodb://localhost:27017/solnet-test',
  CLIENT_URL: 'http://localhost:4200',
  CLIENT_ORIGINS: ['http://localhost:4200'],
  EMAIL_HOST: 'smtp.test.com',
  EMAIL_PORT: 587,
  EMAIL_USER: 'test@test.com',
  EMAIL_PASS: 'testpass',
  ADMIN_NOTIFICATION_EMAIL: 'admin@test.com',
  GOOGLE_MAPS_SERVER_API_KEY: 'test-maps-key',
  SQUARE_ACCESS_TOKEN: 'test-square-token',
  SQUARE_ENVIRONMENT: 'sandbox',
  SQUARE_LOCATION_ID: 'test-location-id',
}));

// Silence console.error in tests unless explicitly needed
global.console.error = jest.fn();
