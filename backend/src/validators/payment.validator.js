const { z } = require('zod');

const uuidSchema = z
  .string()
  .uuid('Invalid ID');

const paymentIdParamSchema = z.object({
  body: z.object({}),

  params: z.object({
    paymentId: uuidSchema,
  }),

  query: z.object({}),
});

const bookingPaymentSchema = z.object({
  body: z.object({
    booking_id: uuidSchema,
  }),

  params: z.object({}),

  query: z.object({}),
});

const paymentStatusSchema = z.object({
  body: z.object({}),

  params: z.object({
    paymentId: uuidSchema,
  }),

  query: z.object({}),
});

module.exports = {
  paymentIdParamSchema,
  bookingPaymentSchema,
  paymentStatusSchema,
};