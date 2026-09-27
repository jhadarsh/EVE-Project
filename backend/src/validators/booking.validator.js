const { z } = require('zod');

const uuidSchema = z
  .string()
  .uuid('Invalid ID');

const patientNameSchema = z
  .string()
  .trim()
  .min(2, 'Patient name must contain at least 2 characters')
  .max(150, 'Patient name is too long');

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long');

const emailSchema = z
  .string()
  .trim()
  .email('Please provide a valid email address')
  .max(320, 'Email address is too long')
  .transform((value) => value.toLowerCase());

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must use YYYY-MM-DD format'
  );

const createBookingSchema = z.object({
  body: z.object({
    centre_id: uuidSchema,

    slot_id: uuidSchema,

    patient_name: patientNameSchema,

    patient_dob: dateSchema.optional(),

    patient_phone: phoneSchema,

    patient_email: emailSchema,

    test_ids: z
      .array(uuidSchema)
      .min(1, 'At least one test must be selected')
      .max(50, 'Too many tests selected')
      .refine(
        (ids) => new Set(ids).size === ids.length,
        'Duplicate tests are not allowed'
      ),
  }),

  params: z.object({}),

  query: z.object({}),
});

const bookingIdParamSchema = z.object({
  body: z.object({}),

  params: z.object({
    bookingId: uuidSchema,
  }),

  query: z.object({}),
});

const bookingListSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .optional(),

    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .optional(),

    status: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'FAILED',
        'CANCELLED',
      ])
      .optional(),
  }),
});

const cancelBookingSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .trim()
      .max(500, 'Cancellation reason is too long')
      .optional(),
  }),

  params: z.object({
    bookingId: uuidSchema,
  }),

  query: z.object({}),
});

module.exports = {
  createBookingSchema,
  bookingIdParamSchema,
  bookingListSchema,
  cancelBookingSchema,
};