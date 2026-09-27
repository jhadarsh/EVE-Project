const config = require('../config/env');
const { supabaseAdmin } = require('../config/supabase');

const LOG_LEVELS = Object.freeze({
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
});

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'cookie',
  'set-cookie',
  'otp',
  'secret',
  'secret_key',
  'service_role_key',
  'publishable_key',
  'payment_credentials',
]);

const sanitizeValue = (value, depth = 0) => {
  if (depth > 5) {
    return '[MAX_DEPTH]';
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack:
        config.nodeEnv === 'production'
          ? undefined
          : value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeValue(item, depth + 1)
    );
  }

  if (typeof value === 'object') {
    const sanitized = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();

      if (SENSITIVE_KEYS.has(normalizedKey)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      sanitized[key] = sanitizeValue(
        nestedValue,
        depth + 1
      );
    }

    return sanitized;
  }

  return '[UNSUPPORTED_VALUE]';
};


const saveLogToDatabase = async ({
  level,
  event,
  message,
  userId = null,
  metadata = null,
}) => {
  try {
    const sanitizedMetadata =
      metadata !== null && metadata !== undefined
        ? sanitizeValue(metadata)
        : null;

    const { data, error } = await supabaseAdmin
      .from('backend_logs')
      .insert({
        event_type: event,
        severity: level,
        message,
        user_id: userId,
        metadata: sanitizedMetadata,
      })
      .select()
      .single();

    if (error) {
      console.error(
        'DATABASE LOG INSERT FAILED:',
        error
      );

      return null;
    }

    console.log(
      'LOG SAVED TO DATABASE:',
      data?.id
    );

    return data;

  } catch (err) {
    console.error(
      'UNEXPECTED DATABASE LOG ERROR:',
      err
    );

    return null;
  }
};


const createLogEntry = ({
  level,
  event,
  message,
  userId = null,
  metadata = null,
}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
  };

  if (userId) {
    entry.userId = userId;
  }

  if (
    metadata !== null &&
    metadata !== undefined
  ) {
    entry.metadata = sanitizeValue(metadata);
  }

  return entry;
};


const writeLog = ({
  level,
  event,
  message,
  userId = null,
  metadata = null,
}) => {

  // Create console log
  const entry = createLogEntry({
    level,
    event,
    message,
    userId,
    metadata,
  });

  const serialized = JSON.stringify(entry);

  if (level === LOG_LEVELS.ERROR) {
    console.error(serialized);
  } else if (level === LOG_LEVELS.WARN) {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }


  // Save to database
  void saveLogToDatabase({
    level,
    event,
    message,
    userId,
    metadata,
  });
};


const info = ({
  event,
  message,
  userId = null,
  metadata = null,
}) => {
  writeLog({
    level: LOG_LEVELS.INFO,
    event,
    message,
    userId,
    metadata,
  });
};


const warn = ({
  event,
  message,
  userId = null,
  metadata = null,
}) => {
  writeLog({
    level: LOG_LEVELS.WARN,
    event,
    message,
    userId,
    metadata,
  });
};


const error = ({
  event,
  message,
  userId = null,
  metadata = null,
}) => {
  writeLog({
    level: LOG_LEVELS.ERROR,
    event,
    message,
    userId,
    metadata,
  });
};


module.exports = {
  LOG_LEVELS,
  info,
  warn,
  error,
  sanitizeValue,
};