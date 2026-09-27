require('dotenv').config();

const requiredEnvVariables = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
];

const missingVariables = requiredEnvVariables.filter((variable) => {
  const value = process.env[variable];

  return !value || value.trim() === '';
});

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(', ')}`
  );
}

const nodeEnv = process.env.NODE_ENV || 'development';

const allowedNodeEnvironments = [
  'development',
  'test',
  'production',
];

if (!allowedNodeEnvironments.includes(nodeEnv)) {
  throw new Error(
    `Invalid NODE_ENV "${nodeEnv}". Allowed values: ${allowedNodeEnvironments.join(
      ', '
    )}`
  );
}

const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    `Invalid PORT "${process.env.PORT}". PORT must be an integer between 1 and 65535.`
  );
}

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

let parsedSupabaseUrl;

try {
  parsedSupabaseUrl = new URL(process.env.SUPABASE_URL);
} catch {
  throw new Error(
    'Invalid SUPABASE_URL. It must be a valid URL such as https://your-project.supabase.co'
  );
}

if (!['http:', 'https:'].includes(parsedSupabaseUrl.protocol)) {
  throw new Error(
    'Invalid SUPABASE_URL. The URL must use http:// or https://.'
  );
}

let parsedFrontendUrl;

try {
  parsedFrontendUrl = new URL(frontendUrl);
} catch {
  throw new Error(
    'Invalid FRONTEND_URL. It must be a valid URL such as http://localhost:3000'
  );
}

if (!['http:', 'https:'].includes(parsedFrontendUrl.protocol)) {
  throw new Error(
    'Invalid FRONTEND_URL. The URL must use http:// or https://.'
  );
}

const config = Object.freeze({
  nodeEnv,

  port,

  frontendUrl,

  supabase: Object.freeze({
    url: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  }),

  logging: Object.freeze({
    level: process.env.LOG_LEVEL || 'info',
  }),
});

module.exports = config;