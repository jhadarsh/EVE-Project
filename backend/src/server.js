const env = require('./config/env');

const app = require('./app');

const {
  info,
  error: logError,
} = require('./logger/logger');

const LOG_EVENTS = require('./logger/log-events');

const PORT = env.port;

info({
  event: LOG_EVENTS.SERVER_STARTED,
  message: 'Test database log',
  metadata: {
    test: true,
  },
});

const server = app.listen(PORT, () => {
  info({
    event: LOG_EVENTS.SERVER_STARTED,
    message: 'Backend server started',
    metadata: {
      port: PORT,
      environment: env.nodeEnv,
    },
  });

  console.log(
    `Backend server running on port ${PORT}`
  );
});

const shutdown = (signal) => {
  info({
    event: LOG_EVENTS.SYSTEM_SHUTDOWN,
    message: `Received ${signal}. Shutting down server`,
  });

  server.close((closeError) => {
    if (closeError) {
      logError({
        event: LOG_EVENTS.SYSTEM_SHUTDOWN,
        message: 'Server shutdown failed',
        metadata: {
          error: closeError.message,
        },
      });

      process.exit(1);
    }

    process.exit(0);
  });
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('unhandledRejection', (reason) => {
  logError({
    event: LOG_EVENTS.UNHANDLED_ERROR,
    message: 'Unhandled promise rejection',
    metadata: {
      reason:
        reason instanceof Error
          ? reason.message
          : String(reason),
    },
  });
});

process.on('uncaughtException', (exception) => {
  logError({
    event: LOG_EVENTS.UNHANDLED_ERROR,
    message: 'Uncaught exception',
    metadata: {
      error: exception.message,
      stack: exception.stack,
    },
  });

  shutdown('uncaughtException');
});