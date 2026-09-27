/**
 * EVE Healthcare API Test Report
 *
 * Run from backend folder:
 *
 *     node tests/api-report.js
 *
 * Status meanings:
 *
 * PASS
 *   The endpoint was successfully verified by this report.
 *
 * NEEDS ADMIN TEST
 *   The endpoint requires a real authenticated ADMIN user.
 *
 * NEEDS REAL USER/DB FIXTURE
 *   The endpoint requires a real authenticated user and database records.
 *
 * NEEDS REAL BOOKING FIXTURE
 *   The endpoint requires a real booking.
 *
 * NEEDS REAL PAYMENT FIXTURE
 *   The endpoint requires a real payment.
 *
 * NEEDS WEBHOOK DB FIX
 *   The webhook validation route works, but the complete business flow
 *   requires real payment/webhook database records.
 *
 * FAIL
 *   The expected API behavior was not received.
 */

const request = require('supertest');

const app = require('../src/app');


// ============================================================
// REPORT STORAGE
// ============================================================

const report = {
  HEALTH: [],
  AUTH: [],
  CENTRES: [],
  TESTS: [],
  BOOKINGS: [],
  PAYMENTS: [],
  WEBHOOK: [],
  LOGS: [],
};


// ============================================================
// ADD RESULT
// ============================================================

function addResult(
  group,
  method,
  endpoint,
  status,
  reason = ''
) {
  report[group].push({
    method,
    endpoint,
    status,
    reason,
  });
}


// ============================================================
// PRINT REPORT
// ============================================================

function printReport() {
  console.log('');
  console.log('EVE HEALTHCARE API TEST REPORT');
  console.log('================================');
  console.log('');

  for (const [group, results] of Object.entries(report)) {
    console.log(group);

    for (const result of results) {
      const endpointText =
        `  ${result.method.padEnd(6)} ${result.endpoint}`;

      console.log(
        `${endpointText.padEnd(48)} ${result.status}`
      );

      if (result.reason) {
        console.log(
          `         ${result.reason}`
        );
      }
    }

    console.log('');
  }

  const allResults = Object.values(report).flat();

  const passCount = allResults.filter(
    (result) => result.status === 'PASS'
  ).length;

  const needsCount = allResults.filter(
    (result) => result.status.startsWith('NEEDS')
  ).length;

  const failCount = allResults.filter(
    (result) => result.status === 'FAIL'
  ).length;

  console.log('================================');
  console.log(`PASS: ${passCount}`);
  console.log(`NEEDS FIXTURE/ADMIN: ${needsCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`TOTAL: ${allResults.length}`);
  console.log('');


  if (failCount === 0) {
    console.log('RESULT: No verified API failures detected.');
  } else {
    console.log('RESULT: Some API checks failed.');
  }

  console.log('');
}


// ============================================================
// HEALTH
// ============================================================

async function testHealth() {
  try {
    const response = await request(app)
      .get('/health');

    if (
      response.status === 200 &&
      response.body &&
      response.body.success === true &&
      response.body.data &&
      response.body.data.status === 'ok'
    ) {
      addResult(
        'HEALTH',
        'GET',
        '/health',
        'PASS'
      );
    } else {
      addResult(
        'HEALTH',
        'GET',
        '/health',
        'FAIL',
        `Expected HTTP 200 healthy response, received ${response.status}`
      );
    }
  } catch (error) {
    addResult(
      'HEALTH',
      'GET',
      '/health',
      'FAIL',
      error.message
    );
  }
}


// ============================================================
// AUTH
// ============================================================

async function testAuth() {
  try {

    // ----------------------------------------------------------
    // SIGNUP
    // ----------------------------------------------------------

    let response = await request(app)
      .post('/api/auth/signup')
      .send({});

    if (response.status === 400) {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/signup',
        'PASS'
      );
    } else {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/signup',
        'FAIL',
        `Expected validation HTTP 400, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // LOGIN
    // ----------------------------------------------------------

    response = await request(app)
      .post('/api/auth/login')
      .send({});

    if (response.status === 400) {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/login',
        'PASS'
      );
    } else {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/login',
        'FAIL',
        `Expected validation HTTP 400, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // VERIFY
    // ----------------------------------------------------------

    response = await request(app)
      .post('/api/auth/verify')
      .send({});

    if (response.status === 400) {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/verify',
        'PASS'
      );
    } else {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/verify',
        'FAIL',
        `Expected validation HTTP 400, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // ME
    // ----------------------------------------------------------

    response = await request(app)
      .get('/api/auth/me');

    if (response.status === 401) {
      addResult(
        'AUTH',
        'GET',
        '/api/auth/me',
        'PASS'
      );
    } else {
      addResult(
        'AUTH',
        'GET',
        '/api/auth/me',
        'FAIL',
        `Expected HTTP 401 without authentication, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // LOGOUT
    // ----------------------------------------------------------

    response = await request(app)
      .post('/api/auth/logout')
      .send({});

    if (response.status === 401) {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/logout',
        'PASS'
      );
    } else {
      addResult(
        'AUTH',
        'POST',
        '/api/auth/logout',
        'FAIL',
        `Expected HTTP 401 without authentication, received ${response.status}`
      );
    }

  } catch (error) {
    addResult(
      'AUTH',
      'AUTH',
      'authentication routes',
      'FAIL',
      error.message
    );
  }
}


// ============================================================
// CENTRES
// ============================================================

async function testCentres() {
  try {

    // ----------------------------------------------------------
    // LIST CENTRES
    // ----------------------------------------------------------

    let response = await request(app)
      .get('/api/centres');

    if (response.status === 200) {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres',
        'PASS'
      );
    } else {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres',
        'FAIL',
        `Expected HTTP 200, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // GET CENTRE
    // ----------------------------------------------------------

    response = await request(app)
      .get('/api/centres/not-a-valid-uuid');

    if (response.status === 400) {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres/:id',
        'PASS'
      );
    } else {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres/:id',
        'FAIL',
        `Expected invalid UUID HTTP 400, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // CENTRE TESTS
    // ----------------------------------------------------------

    response = await request(app)
      .get('/api/centres/not-a-valid-uuid/tests');

    if (response.status === 400) {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres/:id/tests',
        'PASS'
      );
    } else {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres/:id/tests',
        'FAIL',
        `Expected invalid UUID HTTP 400, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // CENTRE SLOTS
    // ----------------------------------------------------------

    response = await request(app)
      .get('/api/centres/not-a-valid-uuid/slots');

    if (response.status === 400) {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres/:id/slots',
        'PASS'
      );
    } else {
      addResult(
        'CENTRES',
        'GET',
        '/api/centres/:id/slots',
        'FAIL',
        `Expected invalid UUID HTTP 400, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // ADMIN CREATE CENTRE
    // ----------------------------------------------------------

    addResult(
      'CENTRES',
      'POST',
      '/api/centres',
      'NEEDS ADMIN TEST',
      'Requires a real authenticated ADMIN user.'
    );


    // ----------------------------------------------------------
    // ADMIN UPDATE CENTRE
    // ----------------------------------------------------------

    addResult(
      'CENTRES',
      'PATCH',
      '/api/centres/:id',
      'NEEDS ADMIN TEST',
      'Requires a real centre UUID and authenticated ADMIN user.'
    );

  } catch (error) {
    addResult(
      'CENTRES',
      'API',
      'centre routes',
      'FAIL',
      error.message
    );
  }
}


// ============================================================
// DIAGNOSTIC TESTS
// ============================================================

async function testDiagnosticTests() {
  try {

    // ----------------------------------------------------------
    // LIST TESTS
    // ----------------------------------------------------------

    let response = await request(app)
      .get('/api/tests');

    if (response.status === 200) {
      addResult(
        'TESTS',
        'GET',
        '/api/tests',
        'PASS'
      );
    } else {
      addResult(
        'TESTS',
        'GET',
        '/api/tests',
        'FAIL',
        `Expected HTTP 200, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // GET TEST
    // ----------------------------------------------------------

    response = await request(app)
      .get('/api/tests/not-a-valid-uuid');

    if (response.status === 400) {
      addResult(
        'TESTS',
        'GET',
        '/api/tests/:id',
        'PASS'
      );
    } else {
      addResult(
        'TESTS',
        'GET',
        '/api/tests/:id',
        'FAIL',
        `Expected invalid UUID HTTP 400, received ${response.status}`
      );
    }


    // ----------------------------------------------------------
    // ADMIN CREATE TEST
    // ----------------------------------------------------------

    addResult(
      'TESTS',
      'POST',
      '/api/tests',
      'NEEDS ADMIN TEST',
      'Requires a real authenticated ADMIN user.'
    );


    // ----------------------------------------------------------
    // ADMIN UPDATE TEST
    // ----------------------------------------------------------

    addResult(
      'TESTS',
      'PATCH',
      '/api/tests/:id',
      'NEEDS ADMIN TEST',
      'Requires a real diagnostic-test UUID and authenticated ADMIN user.'
    );

  } catch (error) {
    addResult(
      'TESTS',
      'API',
      'diagnostic test routes',
      'FAIL',
      error.message
    );
  }
}


// ============================================================
// BOOKINGS
// ============================================================

async function testBookings() {

  /*
   * We do not mark these as PASS just because the route exists.
   *
   * A real booking requires:
   *
   * 1. Supabase authenticated user
   * 2. Centre
   * 3. Centre-test relationship
   * 4. Appointment slot
   * 5. Diagnostic test
   *
   * Therefore these need real fixtures.
   */

  addResult(
    'BOOKINGS',
    'POST',
    '/api/bookings',
    'NEEDS REAL USER/DB FIXTURE',
    'Requires authenticated user + real centre + slot + centre-test records.'
  );


  addResult(
    'BOOKINGS',
    'GET',
    '/api/bookings',
    'NEEDS REAL USER/DB FIXTURE',
    'Requires a valid Supabase access token.'
  );


  addResult(
    'BOOKINGS',
    'GET',
    '/api/bookings/:id',
    'NEEDS REAL USER/DB FIXTURE',
    'Requires authenticated booking owner + real booking UUID.'
  );


  addResult(
    'BOOKINGS',
    'POST',
    '/api/bookings/:id/cancel',
    'NEEDS REAL USER/DB FIXTURE',
    'Requires authenticated booking owner + real PENDING or CONFIRMED booking.'
  );
}


// ============================================================
// PAYMENTS
// ============================================================

async function testPayments() {

  addResult(
    'PAYMENTS',
    'POST',
    '/api/payments',
    'NEEDS REAL BOOKING FIXTURE',
    'Requires authenticated booking owner + real PENDING booking.'
  );


  addResult(
    'PAYMENTS',
    'GET',
    '/api/payments/:id',
    'NEEDS REAL PAYMENT FIXTURE',
    'Requires authenticated booking owner + real payment UUID.'
  );


  addResult(
    'PAYMENTS',
    'GET',
    '/api/payments/:id/status',
    'NEEDS REAL PAYMENT FIXTURE',
    'Requires authenticated booking owner + real payment UUID.'
  );
}


// ============================================================
// WEBHOOK
// ============================================================

async function testWebhook() {
  try {

    // ----------------------------------------------------------
    // VALIDATION CHECK
    // ----------------------------------------------------------

    const response = await request(app)
      .post('/api/payments/webhook')
      .send({});

    if (response.status === 400) {
      addResult(
        'WEBHOOK',
        'POST',
        '/api/payments/webhook',
        'PASS',
        'Webhook route and request validation are working.'
      );
    } else {
      addResult(
        'WEBHOOK',
        'POST',
        '/api/payments/webhook',
        'FAIL',
        `Expected validation HTTP 400, received ${response.status}`
      );
    }

  } catch (error) {
    addResult(
      'WEBHOOK',
      'POST',
      '/api/payments/webhook',
      'FAIL',
      error.message
    );
  }


  // ----------------------------------------------------------
  // REAL BUSINESS FLOW
  // ----------------------------------------------------------

  addResult(
    'WEBHOOK',
    'POST',
    '/api/payments/webhook',
    'NEEDS WEBHOOK DB FIX',
    'Successful webhook processing requires a real payment and webhook-event database fixture.'
  );
}


// ============================================================
// LOGS
// ============================================================

async function testLogs() {
  try {

    const response = await request(app)
      .get('/api/logs');

    /*
     * No Authorization header means the endpoint should be protected.
     *
     * Depending on middleware order, either 401 or 403 can be valid.
     */

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      addResult(
        'LOGS',
        'GET',
        '/api/logs',
        'PASS',
        'Authentication/admin protection is working.'
      );
    } else {
      addResult(
        'LOGS',
        'GET',
        '/api/logs',
        'FAIL',
        `Expected HTTP 401 or 403, received ${response.status}`
      );
    }

  } catch (error) {
    addResult(
      'LOGS',
      'GET',
      '/api/logs',
      'FAIL',
      error.message
    );
  }
}


// ============================================================
// MAIN
// ============================================================

async function main() {

  console.log('');
  console.log('Running EVE Healthcare API checks...');
  console.log('');

  await testHealth();

  await testAuth();

  await testCentres();

  await testDiagnosticTests();

  await testBookings();

  await testPayments();

  await testWebhook();

  await testLogs();

  printReport();


  // ----------------------------------------------------------
  // Exit with code 1 only when a real verified check failed.
  // ----------------------------------------------------------

  const hasFailure = Object.values(report)
    .flat()
    .some((result) => result.status === 'FAIL');

  if (hasFailure) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}


main().catch((error) => {

  console.error('');
  console.error('API REPORT FAILED');
  console.error('=================');
  console.error(error);
  console.error('');

  process.exitCode = 1;
});