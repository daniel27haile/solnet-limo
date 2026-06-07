const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./middleware/error.middleware');
const env = require('./config/env');

const app = express();

// Security headers
// In development, relax Helmet policies that block cross-origin API calls from
// the Angular dev server (localhost:4200 → localhost:3001):
//   - crossOriginResourcePolicy: 'same-origin' blocks withFetch() cross-origin reads
//   - contentSecurityPolicy: 'upgrade-insecure-requests' breaks HTTP-only dev URLs
// Production keeps full Helmet defaults.
if (env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }));
}

// CORS — dev: localhost only; prod: production origins from CLIENT_ORIGINS env var
const allowedOrigins = env.NODE_ENV === 'production'
  ? env.CLIENT_ORIGINS
  : ['http://localhost:4200', 'http://127.0.0.1:4200'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate limiting ──────────────────────────────────────────────────────────────
// Login — strict: 10 attempts per 15 minutes prevents brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Payment — 20 attempts per hour prevents card-testing abuse
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment requests. Please try again later.' },
});

// Contact / maps — 10 per hour prevents spam and Google Maps quota exhaustion
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// General API — 200 per 15 minutes for all other routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/payments',   paymentLimiter);
app.use('/api/contact',    contactLimiter);
app.use('/api/maps',       contactLimiter);
app.use('/api',            apiLimiter);

// Routes
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/fleet', require('./routes/fleet.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/maps', require('./routes/maps.routes'));
app.use('/api/pricing', require('./routes/pricing.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reviews', require('./routes/review.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'solnet-limo-api', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;
