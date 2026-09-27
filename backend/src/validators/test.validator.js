const { z } = require('zod');

const uuidSchema = z
  .string()
  .uuid('Invalid test ID');

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

const testListSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: paginationQuery,
});

const testIdParamSchema = z.object({
  body: z.object({}),

  params: z.object({
    testId: uuidSchema,
  }),

  query: z.object({}),
});

const createTestSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(150),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    information: z
      .string()
      .trim()
      .max(5000)
      .optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

const updateTestSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    information: z
      .string()
      .trim()
      .max(5000)
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
    testId: uuidSchema,
  }),

  query: z.object({}),
});

const testCentresSchema = z.object({
  body: z.object({}),

  params: z.object({
    testId: uuidSchema,
  }),

  query: paginationQuery,
});

module.exports = {
  testListSchema,
  testIdParamSchema,
  createTestSchema,
  testCentresSchema,
  updateTestSchema,
};