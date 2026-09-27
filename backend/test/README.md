# EVE Healthcare Backend Tests

Run the suite with:

    npm test

Coverage included:
- authentication validation and protected endpoints
- public diagnostic centres
- public tests
- booking validation and authorization
- payment validation and authorization
- payment webhook validation
- UUID and pagination validation
- protected/admin access checks

These tests do not create or delete production Supabase records.

Full business-flow tests such as successful signup/login, booking creation,
successful/failed payment, webhook idempotency, and admin CRUD require seeded
test data and/or a dedicated test account and should be enabled only against
a test database.
