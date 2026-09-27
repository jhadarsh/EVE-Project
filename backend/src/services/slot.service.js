const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');

const getSlot = async (slotId) => {
  const { data, error } = await supabaseAdmin
    .from('appointment_slots')
    .select('*')
    .eq('id', slotId)
    .maybeSingle();

  if (error) {
    throw ApiError.internal(
      'Unable to retrieve appointment slot',
      {
        code: 'SLOT_LOOKUP_FAILED',
        details: error.message,
      }
    );
  }

  if (!data) {
    throw ApiError.notFound(
      'Appointment slot not found',
      {
        code: 'SLOT_NOT_FOUND',
      }
    );
  }

  return data;
};


const validateSlotForBooking = async (
  slotId,
  centreId
) => {

  const slot =
    await getSlot(slotId);


  if (slot.centre_id !== centreId) {
    throw ApiError.badRequest(
      'Appointment slot does not belong to this centre',
      {
        code:
          'SLOT_CENTRE_MISMATCH',
      }
    );
  }


  if (!slot.is_active) {
    throw ApiError.conflict(
      'Appointment slot is no longer active',
      {
        code:
          'SLOT_INACTIVE',
      }
    );
  }


  const now = new Date();

  const appointmentDateTime =
    new Date(
      `${slot.appointment_date}T${slot.start_time}`
    );


  if (
    Number.isNaN(
      appointmentDateTime.getTime()
    ) ||
    appointmentDateTime <= now
  ) {
    throw ApiError.badRequest(
      'Appointment slot is in the past',
      {
        code:
          'SLOT_IN_PAST',
      }
    );
  }


  if (
    slot.booked_count >=
    slot.capacity
  ) {
    throw ApiError.conflict(
      'Appointment slot is full',
      {
        code:
          'SLOT_UNAVAILABLE',
      }
    );
  }


  return slot;
};


// ======================================================
// ATOMIC SLOT RESERVATION
// ======================================================

const reserveSlot = async (
  slotId,
  centreId
) => {

  const {
    data,
    error,
  } = await supabaseAdmin.rpc(
    'reserve_appointment_slot',
    {
      p_slot_id: slotId,
      p_centre_id: centreId,
    }
  );


  if (error) {

    if (
      error.message?.includes(
        'SLOT_NOT_FOUND'
      )
    ) {
      throw ApiError.notFound(
        'Appointment slot not found',
        {
          code:
            'SLOT_NOT_FOUND',
        }
      );
    }


    if (
      error.message?.includes(
        'SLOT_FULL'
      )
    ) {
      throw ApiError.conflict(
        'Appointment slot is full',
        {
          code:
            'SLOT_UNAVAILABLE',
        }
      );
    }


    throw ApiError.internal(
      'Unable to reserve appointment slot',
      {
        code:
          'SLOT_RESERVATION_FAILED',

        details:
          error.message,
      }
    );
  }


  if (!data) {

    throw ApiError.internal(
      'Unable to reserve appointment slot',
      {
        code:
          'SLOT_RESERVATION_FAILED',
      }
    );
  }


  return {
    slot: data.slot,

    queueNumber:
      data.queue_number,
  };
};


// ======================================================
// RELEASE SLOT
// ======================================================

const releaseSlot = async (
  slotId
) => {

  const slot =
    await getSlot(slotId);


  if (
    slot.booked_count <= 0
  ) {
    return slot;
  }


  const {
    data,
    error,
  } = await supabaseAdmin
    .from('appointment_slots')
    .update({
      booked_count:
        slot.booked_count - 1,
    })
    .eq('id', slotId)
    .gt('booked_count', 0)
    .select('*')
    .maybeSingle();


  if (error) {

    throw ApiError.internal(
      'Unable to release appointment slot',
      {
        code:
          'SLOT_RELEASE_FAILED',

        details:
          error.message,
      }
    );
  }


  return data || slot;
};


module.exports = {
  getSlot,
  validateSlotForBooking,
  reserveSlot,
  releaseSlot,
};