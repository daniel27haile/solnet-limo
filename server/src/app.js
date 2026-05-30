const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/error.middleware');
const env = require('./config/env');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: env.CLIENT_URL,
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Solnet Limo API is running' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;
