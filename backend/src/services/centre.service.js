const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');
const {
  getPagination,
  getPaginationMeta,
} = require('../utils/pagination');

const {
  info,
  error: logError,
} = require('../logger/logger');

const LOG_EVENTS = require('../logger/log-events');


// ======================================================
// CENTRE
// ======================================================

const ensureCentre = async (
  centreId,
  includeInactive = false
) => {

  let query = supabaseAdmin
    .from('diagnostic_centres')
    .select('*')
    .eq('id', centreId);

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const {
    data,
    error,
  } = await query.maybeSingle();

  if (error) {
    throw ApiError.internal(
      'Unable to retrieve diagnostic centre',
      {
        code: 'CENTRE_LOOKUP_FAILED',
        details: error.message,
      }
    );
  }

  if (!data) {
    throw ApiError.notFound(
      'Diagnostic centre not found',
      {
        code: 'CENTRE_NOT_FOUND',
      }
    );
  }

  return data;
};


// ======================================================
// LIST CENTRES
// ======================================================

const listCentres = async (
  queryParams = {}
) => {

  const {
    page,
    limit,
    offset,
  } = getPagination(queryParams);

  let query = supabaseAdmin
    .from('diagnostic_centres')
    .select('*', {
      count: 'exact',
    })
    .eq('is_active', true)
    .order('name', {
      ascending: true,
    })
    .range(
      offset,
      offset + limit - 1
    );

  if (queryParams.search) {

    const search =
      queryParams.search.replace(/,/g, '');

    query = query.or(
      `name.ilike.%${search}%,location.ilike.%${search}%`
    );
  }

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    throw ApiError.internal(
      'Unable to retrieve diagnostic centres',
      {
        code: 'CENTRE_LIST_FAILED',
        details: error.message,
      }
    );
  }

  return {
    items: data || [],
    meta: getPaginationMeta({
      page,
      limit,
      total: count || 0,
    }),
  };
};


// ======================================================
// GET CENTRE
// ======================================================

const getCentre = async (
  centreId
) => ensureCentre(centreId);


// ======================================================
// TIME HELPERS
// ======================================================

const timeToMinutes = (time) => {

  const [
    hours,
    minutes,
  ] = time
    .split(':')
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
};


const minutesToTime = (minutes) => {

  const hours =
    Math.floor(minutes / 60);

  const mins =
    minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
};


// ======================================================
// DATE HELPER
// ======================================================

const formatDate = (date) => {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


// ======================================================
// GENERATE DEFAULT SLOTS
// ======================================================
//
// Creates:
//
// 5 days
// ×
// 5 slots per day
// =
// 25 slots
//
// 09:00 -> 17:00
//
// ======================================================

const generateDefaultSlots = (
  centreId
) => {

  const START_TIME = '09:00';
  const END_TIME = '17:00';

  const NUMBER_OF_SLOTS_PER_DAY = 5;

  const NUMBER_OF_DAYS = 5;

  // Change this to whatever number of
  // patients/seats you want per slot.
  const CAPACITY_PER_SLOT = 10;


  const startMinutes =
    timeToMinutes(
      START_TIME
    );

  const endMinutes =
    timeToMinutes(
      END_TIME
    );


  const totalMinutes =
    endMinutes - startMinutes;


  const slotDuration =
    totalMinutes /
    NUMBER_OF_SLOTS_PER_DAY;


  const slots = [];


  for (
    let dayIndex = 1;
    dayIndex <= NUMBER_OF_DAYS;
    dayIndex++
  ) {

    const appointmentDate =
      new Date();

    appointmentDate.setDate(
      appointmentDate.getDate() +
      dayIndex
    );


    const date =
      formatDate(
        appointmentDate
      );


    for (
      let slotIndex = 0;
      slotIndex < NUMBER_OF_SLOTS_PER_DAY;
      slotIndex++
    ) {

      const slotStart =
        startMinutes +
        (
          slotIndex *
          slotDuration
        );


      const slotEnd =
        slotStart +
        slotDuration;


      slots.push({
        centre_id: centreId,

        appointment_date: date,

        start_time:
          minutesToTime(
            slotStart
          ),

        end_time:
          minutesToTime(
            slotEnd
          ),

        capacity:
          CAPACITY_PER_SLOT,

        booked_count: 0,

        is_active: true,
      });
    }
  }


  return slots;
};


// ======================================================
// CREATE CENTRE
// ======================================================

const createCentre = async (
  payload,
  adminUserId
) => {

  /*
   * ----------------------------------------------------
   * STEP 1
   * Create the centre
   * ----------------------------------------------------
   */

  const {
    data,
    error,
  } = await supabaseAdmin
    .from('diagnostic_centres')
    .insert({
      name: payload.name,
      location: payload.location,
      address: payload.address,
      description:
        payload.description ?? null,
    })
    .select('*')
    .single();


  if (error) {

    if (error.code === '23505') {

      throw ApiError.conflict(
        'Diagnostic centre already exists',
        {
          code: 'CENTRE_EXISTS',
        }
      );
    }


    throw ApiError.internal(
      'Unable to create diagnostic centre',
      {
        code: 'CENTRE_CREATE_FAILED',
        details: error.message,
      }
    );
  }


  /*
   * ----------------------------------------------------
   * STEP 2
   * Generate default appointment slots
   * ----------------------------------------------------
   */

  const slots =
    generateDefaultSlots(
      data.id
    );


  /*
   * ----------------------------------------------------
   * STEP 3
   * Insert all 25 slots
   * ----------------------------------------------------
   */

  const {
    data: createdSlots,
    error: slotError,
  } = await supabaseAdmin
    .from('appointment_slots')
    .insert(slots)
    .select('*');


  /*
   * ----------------------------------------------------
   * IMPORTANT
   *
   * Centre was created but slot creation failed.
   * Delete the centre so we don't leave the database
   * in an incomplete state.
   * ----------------------------------------------------
   */

  if (slotError) {

    logError({
      event:
        LOG_EVENTS.ADMIN_ACTION,

      message:
        'Appointment slot creation failed after centre creation',

      userId:
        adminUserId,

      metadata: {
        centreId: data.id,

        error:
          slotError.message,
      },
    });


    await supabaseAdmin
      .from('diagnostic_centres')
      .delete()
      .eq('id', data.id);


    throw ApiError.internal(
      'Unable to create appointment slots for diagnostic centre',
      {
        code: 'CENTRE_SLOT_CREATE_FAILED',

        details:
          slotError.message,
      }
    );
  }


  /*
   * ----------------------------------------------------
   * STEP 4
   * Log centre creation
   * ----------------------------------------------------
   */

  info({
    event:
      LOG_EVENTS.ADMIN_ACTION,

    message:
      'Diagnostic centre created with appointment slots',

    userId:
      adminUserId,

    metadata: {
      centreId:
        data.id,

      slotsCreated:
        createdSlots?.length || 0,
    },
  });


  /*
   * ----------------------------------------------------
   * STEP 5
   * Return centre + slots
   * ----------------------------------------------------
   */

  return {
    centre: data,

    slots:
      createdSlots || [],
  };
};


// ======================================================
// UPDATE CENTRE
// ======================================================

const updateCentre = async (
  centreId,
  payload,
  adminUserId
) => {

  await ensureCentre(
    centreId,
    true
  );


  const {
    data,
    error,
  } = await supabaseAdmin
    .from('diagnostic_centres')
    .update(payload)
    .eq('id', centreId)
    .select('*')
    .single();


  if (error) {

    throw ApiError.internal(
      'Unable to update diagnostic centre',
      {
        code: 'CENTRE_UPDATE_FAILED',
        details: error.message,
      }
    );
  }


  info({
    event:
      LOG_EVENTS.ADMIN_ACTION,

    message:
      'Diagnostic centre updated',

    userId:
      adminUserId,

    metadata: {
      centreId,
    },
  });


  return data;
};


// ======================================================
// CENTRE TESTS
// ======================================================

const listCentreTests = async (
  centreId,
  queryParams = {}
) => {

  await ensureCentre(
    centreId
  );


  const {
    page,
    limit,
    offset,
  } = getPagination(
    queryParams
  );


  const {
    data,
    error,
    count,
  } = await supabaseAdmin
    .from('centre_tests')
    .select(
      `
      id,
      centre_id,
      test_id,
      price,
      is_available,
      created_at,
      updated_at,
      tests!inner (
        id,
        name,
        description,
        information,
        is_active
      )
      `,
      {
        count: 'exact',
      }
    )
    .eq(
      'centre_id',
      centreId
    )
    .eq(
      'is_available',
      true
    )
    .eq(
      'tests.is_active',
      true
    )
    .order(
      'created_at',
      {
        ascending: true,
      }
    )
    .range(
      offset,
      offset + limit - 1
    );


  if (error) {

    throw ApiError.internal(
      'Unable to retrieve centre tests',
      {
        code:
          'CENTRE_TESTS_LOOKUP_FAILED',

        details:
          error.message,
      }
    );
  }


  return {
    items:
      data || [],

    meta:
      getPaginationMeta({
        page,
        limit,
        total: count || 0,
      }),
  };
};


// ======================================================
// CENTRE SLOTS
// ======================================================

const listCentreSlots = async (
  centreId,
  queryParams = {}
) => {

  await ensureCentre(
    centreId
  );


  const {
    page,
    limit,
    offset,
  } = getPagination(
    queryParams
  );


  let query = supabaseAdmin
    .from('appointment_slots')
    .select('*', {
      count: 'exact',
    })
    .eq(
      'centre_id',
      centreId
    )
    .eq(
      'is_active',
      true
    )
    .order(
      'appointment_date',
      {
        ascending: true,
      }
    )
    .order(
      'start_time',
      {
        ascending: true,
      }
    )
    .range(
      offset,
      offset + limit - 1
    );


  if (queryParams.date) {

    query = query.eq(
      'appointment_date',
      queryParams.date
    );
  }


  const {
    data,
    error,
    count,
  } = await query;


  if (error) {

    throw ApiError.internal(
      'Unable to retrieve appointment slots',
      {
        code:
          'SLOT_LIST_FAILED',

        details:
          error.message,
      }
    );
  }


  const items =
    (data || []).map(
      (slot) => ({
        ...slot,

        available_count:
          Math.max(
            slot.capacity -
              slot.booked_count,
            0
          ),
      })
    );


  return {
    items,

    meta:
      getPaginationMeta({
        page,
        limit,
        total: count || 0,
      }),
  };
};


// ======================================================
// ADD CENTRE TEST
// ======================================================

const addCentreTest = async (
  centreId,
  payload,
  adminUserId
) => {

  await ensureCentre(
    centreId,
    true
  );


  const {
    data: test,
    error: testError,
  } = await supabaseAdmin
    .from('tests')
    .select(
      'id, name, is_active'
    )
    .eq(
      'id',
      payload.test_id
    )
    .maybeSingle();


  if (testError) {

    throw ApiError.internal(
      'Unable to retrieve test',
      {
        code:
          'TEST_LOOKUP_FAILED',

        details:
          testError.message,
      }
    );
  }


  if (!test) {

    throw ApiError.notFound(
      'Test not found',
      {
        code:
          'TEST_NOT_FOUND',
      }
    );
  }


  if (!test.is_active) {

    throw ApiError.badRequest(
      'Test is inactive',
      {
        code:
          'TEST_INACTIVE',
      }
    );
  }


  const {
    data,
    error,
  } = await supabaseAdmin
    .from('centre_tests')
    .insert({
      centre_id:
        centreId,

      test_id:
        payload.test_id,

      price:
        payload.price,

      is_available:
        payload.is_available ??
        true,
    })
    .select('*')
    .single();


  if (error) {

    if (error.code === '23505') {

      throw ApiError.conflict(
        'Test is already assigned to this centre',
        {
          code:
            'CENTRE_TEST_EXISTS',
        }
      );
    }


    throw ApiError.internal(
      'Unable to assign test to centre',
      {
        code:
          'CENTRE_TEST_CREATE_FAILED',

        details:
          error.message,
      }
    );
  }


  info({
    event:
      LOG_EVENTS.ADMIN_ACTION,

    message:
      'Test assigned to diagnostic centre',

    userId:
      adminUserId,

    metadata: {
      centreId,
      testId:
        payload.test_id,
    },
  });


  return data;
};


// ======================================================
// MANUAL CREATE SLOT
// ======================================================
//
// Keep this if you still want an admin to manually
// create an individual slot later.
// ======================================================

const createSlot = async (
  centreId,
  payload,
  adminUserId
) => {

  await ensureCentre(
    centreId,
    true
  );


  const {
    data,
    error,
  } = await supabaseAdmin
    .from('appointment_slots')
    .insert({
      centre_id:
        centreId,

      appointment_date:
        payload.appointment_date,

      start_time:
        payload.start_time,

      end_time:
        payload.end_time,

      capacity:
        payload.capacity,

      booked_count: 0,

      is_active: true,
    })
    .select('*')
    .single();


  if (error) {

    if (error.code === '23505') {

      throw ApiError.conflict(
        'Appointment slot already exists',
        {
          code:
            'SLOT_EXISTS',
        }
      );
    }


    throw ApiError.internal(
      'Unable to create appointment slot',
      {
        code:
          'SLOT_CREATE_FAILED',

        details:
          error.message,
      }
    );
  }


  info({
    event:
      LOG_EVENTS.ADMIN_ACTION,

    message:
      'Appointment slot created',

    userId:
      adminUserId,

    metadata: {
      centreId,
      slotId:
        data.id,
    },
  });


  return data;
};


module.exports = {
  ensureCentre,
  listCentres,
  getCentre,
  createCentre,
  updateCentre,
  listCentreTests,
  listCentreSlots,
  addCentreTest,
  createSlot,
};