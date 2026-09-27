const { z } = require('zod');

const webhookSchema = z.object({
  body: z.object({
    event_id: z
      .string()
      .trim()
      .min(1, 'event_id is required')
      .max(255, 'event_id is too long'),

    event_type: z
      .string()
      .trim()
      .min(1, 'event_type is required')
      .max(100, 'event_type is too long'),

    payment_id: z
      .string()
      .uuid('Invalid payment ID')
      .nullable()
      .optional(),

    payload: z
      .record(z.string(), z.unknown())
      .optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

module.exports = {
  webhookSchema,
};