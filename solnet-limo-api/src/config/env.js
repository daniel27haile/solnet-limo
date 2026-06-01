require('dotenv').config();

// Parse comma-separated CLIENT_ORIGINS into an array.
// Falls back to CLIENT_URL as a single-origin list if CLIENT_ORIGINS is not set.
const parseOrigins = () => {
  const raw = process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || 'http://localhost:4200';
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
};

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200',
  CLIENT_ORIGINS: parseOrigins(),
  NODE_ENV: process.env.NODE_ENV || 'development',
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@solnetlimo.com',
  // Google Maps (server-side key — never expose to frontend)
  GOOGLE_MAPS_SERVER_API_KEY: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
  // Square Payment
  SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN || '',
  SQUARE_ENVIRONMENT: process.env.SQUARE_ENVIRONMENT || 'sandbox',
  SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID || '',
};

const required = ['MONGO_URI', 'JWT_SECRET'];

required.forEach((key) => {
  if (!env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = env;
