const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
