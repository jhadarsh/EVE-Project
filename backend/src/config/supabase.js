const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const config = require('./env');

const commonOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },

  realtime: {
    transport: WebSocket,
  },
};

/**
 * Standard Supabase client.
 *
 * Uses the publishable key.
 *
 * Use this client when an operation should respect
 * normal Supabase permissions / RLS behavior.
 */
const supabase = createClient(
  config.supabase.url,
  config.supabase.publishableKey,
  commonOptions
);

/**
 * Server-side Supabase client.
 *
 * Uses the secret key.
 *
 * IMPORTANT:
 * - Never expose this client to the frontend.
 * - Never return this key in an API response.
 * - Never log this key.
 *
 * This client is intended for trusted backend operations.
 */
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.secretKey,
  commonOptions
);

module.exports = {
  supabase,
  supabaseAdmin,
};