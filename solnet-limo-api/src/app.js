const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/error.middleware');
const env = require('./config/env');

const app = express();

// Security headers
app.use(helmet());

// CORS — allows all origins listed in CLIENT_ORIGINS (supports www + non-www)
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and listed origins
    if (!origin || env.CLIENT_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
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
