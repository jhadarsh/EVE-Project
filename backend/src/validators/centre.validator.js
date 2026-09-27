const { z } = require('zod');

const uuidSchema = z
  .string()
  .uuid('Invalid centre ID');

const paginationQuery = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .optional(),

  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .optional(),

  search: z
    .string()
    .trim()
    .max(100, 'Search query is too long')
    .optional(),
});

const centreIdParamSchema = z.object({
  body: z.object({}),

  params: z.object({
    centreId: uuidSchema,
  }),

  query: z.object({}),
});

const centreListSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: paginationQuery,
});

const createCentreSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(150),

    location: z
      .string()
      .trim()
      .min(2)
      .max(150),

    address: z
      .string()
      .trim()
      .min(5)
      .max(500),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

const updateCentreSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    location: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    address: z
      .string()
      .trim()
      .min(5)
      .max(500)
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    is_active: z
      .boolean()
      .optional(),
  })
    .refine(
      (value) => Object.keys(value).length > 0,
      'At least one field is required'
    ),

  params: z.object({
    centreId: uuidSchema,
  }),

  query: z.object({}),
});

const centreTestsSchema = z.object({
  body: z.object({}),

  params: z.object({
    centreId: uuidSchema,
  }),

  query: paginationQuery,
});

const centreSlotsSchema = z.object({
  body: z.object({}),

  params: z.object({
    centreId: uuidSchema,
  }),

  query: z.object({
    date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Date must use YYYY-MM-DD format'
      )
      .optional(),

    page: z
      .string()
      .regex(/^\d+$/)
      .optional(),

    limit: z
      .string()
      .regex(/^\d+$/)
      .optional(),
  }),
});

const addCentreTestSchema = z.object({
  body: z.object({
    test_id: uuidSchema,

    price: z
      .number()
      .nonnegative('Price cannot be negative'),

    is_available: z
      .boolean()
      .optional()
      .default(true),
  }),

  params: z.object({
    centreId: uuidSchema,
  }),

  query: z.object({}),
});

module.exports = {
  centreIdParamSchema,
  centreListSchema,
  createCentreSchema,
  updateCentreSchema,
  centreTestsSchema,
  addCentreTestSchema,
  centreSlotsSchema,
};