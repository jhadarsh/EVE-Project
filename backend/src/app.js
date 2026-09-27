const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const {
  generalRateLimiter,
} = require('./middleware/rate-limit.middleware');

const notFoundMiddleware = require('./middleware/not-found.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const centreRoutes = require('./routes/centre.routes');
const logRoutes = require('./routes/log.routes');
const paymentRoutes = require('./routes/payment.routes');
const testRoutes = require('./routes/test.routes');

const app = express();

/*
 * ------------------------------------------------------------
 * Security
 * ------------------------------------------------------------
 */

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/*
 * ------------------------------------------------------------
 * CORS
 * ------------------------------------------------------------
 *
 * Local frontend:
 *   http://localhost:5173
 *
 * Production frontend:
 *   Set FRONTEND_URL in Render environment variables
 *   Example:
 *   FRONTEND_URL=https://your-app.netlify.app
 * ------------------------------------------------------------
 */

const allowedOrigins = [
  'http://localhost:5173',
   process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

/*
 * ------------------------------------------------------------
 * Request parsing
 * ------------------------------------------------------------
 */

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

/*
 * ------------------------------------------------------------
 * General rate limiting
 * ------------------------------------------------------------
 */

app.use(generalRateLimiter);

/*
 * ------------------------------------------------------------
 * Health check
 * ------------------------------------------------------------
 */

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Backend is healthy',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

/*
 * ------------------------------------------------------------
 * Swagger documentation
 * ------------------------------------------------------------
 */

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  })
);

/*
 * ------------------------------------------------------------
 * API routes
 * ------------------------------------------------------------
 */

// const slotRoutes = require('./routes/slot.routes');

// app.use('/api', slotRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/logs', logRoutes);

/*
 * ------------------------------------------------------------
 * 404
 * ------------------------------------------------------------
 */

app.use(notFoundMiddleware);

/*
 * ------------------------------------------------------------
 * Centralized error handler
 * ------------------------------------------------------------
 */

app.use(errorMiddleware);

module.exports = app;