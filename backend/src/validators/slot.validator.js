const { z } = require('zod');

const uuidSchema = z
  .string()
  .uuid('Invalid ID');

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must use YYYY-MM-DD format'
  );

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    'Time must use HH:mm format'
  );


// POST /centres/:centreId/slots

const createSlotsSchema = z.object({
  body: z.object({

    appointment_date: dateSchema,

    start_time: timeSchema,

    end_time: timeSchema,

    number_of_slots: z
      .number()
      .int()
      .min(1)
      .max(100),

    capacity: z
      .number()
      .int()
      .min(1)
      .max(100000),

  }),

  params: z.object({
    centreId: uuidSchema,
  }),

  query: z.object({}),
});


// GET /centres/:centreId/slots

const listCentreSlotsSchema = z.object({

  body: z.object({}),

  params: z.object({
    centreId: uuidSchema,
  }),

  query: z.object({
    date: dateSchema.optional(),
  }),

});


// GET /slots/:slotId

const slotIdParamSchema = z.object({

  body: z.object({}),

  params: z.object({
    slotId: uuidSchema,
  }),

  query: z.object({}),

});


// PATCH /slots/:slotId

const updateSlotSchema = z.object({

  body: z.object({

    capacity: z
      .number()
      .int()
      .min(1)
      .max(100000)
      .optional(),

    is_active: z
      .boolean()
      .optional(),

  }),

  params: z.object({
    slotId: uuidSchema,
  }),

  query: z.object({}),

});


// DELETE /slots/:slotId

const deleteSlotSchema = z.object({

  body: z.object({}),

  params: z.object({
    slotId: uuidSchema,
  }),

  query: z.object({}),

});


module.exports = {
  createSlotsSchema,
  listCentreSlotsSchema,
  slotIdParamSchema,
  updateSlotSchema,
  deleteSlotSchema,
};