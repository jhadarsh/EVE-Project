const { z } = require('zod');

const emailSchema = z
  .string()
  .trim()
  .email('Please provide a valid email address')
  .max(320, 'Email address is too long')
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .max(128, 'Password must not exceed 128 characters');

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Full name must contain at least 2 characters')
  .max(100, 'Full name must not exceed 100 characters');

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long');

const signupSchema = z.object({
  body: z.object({
    email: emailSchema,

    password: passwordSchema,

    full_name: fullNameSchema,

    phone: phoneSchema,
  }),

  params: z.object({}),

  query: z.object({}),
});

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,

    password: passwordSchema,
  }),

  params: z.object({}),

  query: z.object({}),
});

const verifySchema = z.object({
  body: z.object({
    email: emailSchema,

    token: z
      .string()
      .trim()
      .min(4, 'Verification code is required')
      .max(20, 'Verification code is invalid'),

    type: z
      .enum([
        'signup',
        'email',
        'recovery',
        'invite',
        'email_change',
      ])
      .default('signup'),
  }),

  params: z.object({}),

  query: z.object({}),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),

  params: z.object({}),

  query: z.object({}),
});

const logoutSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: z.object({}),
});

module.exports = {
  signupSchema,
  loginSchema,
  verifySchema,
  resendVerificationSchema,
  logoutSchema,
};