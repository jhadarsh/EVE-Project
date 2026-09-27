# EVE Healthcare — Backend

A Node.js + Express REST API for a diagnostic test booking platform, using
Supabase for PostgreSQL storage and JWT-based authentication. It covers
centre/test catalogue management, multi-test bookings with atomic slot
reservation and queue numbers, a simulated payment flow, an idempotent
payment webhook, structured logging, and role-based admin endpoints.

For step-by-step local setup, see `HOW_TO_RUN.txt`.
For a full endpoint-by-endpoint reference with request/response examples,
see `API_ENDPOINTS.txt`.

---

## 1. Tech Stack

| Purpose               | Package                                      |
|------------------------|-----------------------------------------------|
| Web framework           | Express 5                                     |
| Database & Auth         | `@supabase/supabase-js` (PostgreSQL + JWT Auth + email verification) |
| Validation              | Zod                                            |
| Security                | Helmet, CORS, `express-rate-limit`             |
| Logging                 | Custom structured JSON logger (backed by a `pino`/`pino-http`-compatible interface) |
| API documentation       | `swagger-jsdoc` + `swagger-ui-express` (served at `/api-docs`) |
| Realtime dependency     | `ws` (required by the Supabase realtime client) |
| Testing                 | Jest + Supertest                               |
| Dev tooling             | Nodemon                                        |

## 2. Architecture

```text
                    React Frontend
                          │
                          │  REST (JSON over HTTPS)
                          ▼
                 Node.js + Express API
        ┌──────────────────┴───────────────────┐
        │  routes → controllers → services      │
        │  middleware: auth, validation, rate    │
        │  limiting, structured logging          │
        └──────────────────┬───────────────────┘
                          │
              ┌───────────┴────────────┐
              ▼                        ▼
       Supabase Auth              Supabase PostgreSQL
     (JWT, email/OTP)         (centres, tests, bookings,
                                payments, webhook events,
                                logs)
```

The API is organized in layers:

- **routes/** — endpoint definitions and route-level middleware (auth, rate
  limits, request validation).
- **controllers/** — request/response handling.
- **services/** — business logic: slot reservation, price calculation,
  payment simulation, webhook processing.
- **middleware/** — JWT verification, role (admin) checks, Zod-based
  request validation, structured request logging, centralized error
  handling.
- **validators/** — Zod schemas for every request body/query.
- **logger/** — structured JSON event logger used across the app and
  surfaced to admins via `GET /api/logs`.

Two Supabase clients are used: a request-scoped `supabase` client (acting
as the authenticated user, respecting row-level security) for normal reads,
and a privileged `supabaseAdmin` client (service role) for operations that
must bypass RLS, such as admin management endpoints and webhook
processing.

## 3. Data Model

The database is PostgreSQL, hosted on Supabase. Because a single booking
can contain multiple tests, bookings and their selected tests are modeled
as a one-to-many relationship (`bookings` → `booking_tests`) rather than
packing multiple test IDs into one column.

```text
profiles ──< bookings >── diagnostic_centres
                │                 │
                │                 └──< centre_tests >── tests
                │
                ├──< booking_tests
                │
                └──< payments ──< webhook_events

diagnostic_centres ──< appointment_slots
backend_logs (independent event log, references user_id where relevant)
```

| Table                | Purpose                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| `profiles`             | App-level user profile (`full_name`, `phone`, `role`), linked 1:1 to a Supabase Auth user. `role` is `USER` or `ADMIN`. |
| `diagnostic_centres`   | `name`, `location`, `address`, `description`, `is_active`.               |
| `tests`                | `name`, `description`, `information`, `is_active`.                       |
| `centre_tests`         | Join table: which `tests` a `diagnostic_centres` offers, at what `price`, with `is_available`. |
| `appointment_slots`    | Slots per centre: `appointment_date`, `start_time`, `end_time`, `capacity`, `booked_count`, `is_active`. Available capacity is derived (`capacity - booked_count`). |
| `bookings`             | One booking per checkout: `user_id`, `centre_id`, `slot_id`, patient details, `total_amount`, `queue_number`, `status` (`PENDING`/`CONFIRMED`/`FAILED`/`CANCELLED`). |
| `booking_tests`        | Line items for a booking: `test_name`, `unit_price`, `quantity`, `subtotal`, captured at booking time so historical bookings remain accurate even if a centre's price later changes. |
| `payments`             | One (or more, across retries) simulated payment attempts per booking: `payment_reference`, `amount`, `status` (`PENDING`/`SUCCESS`/`FAILED`), `provider` (`SIMULATED`), `paid_at`. |
| `webhook_events`       | Every payment-webhook delivery, keyed by a unique `event_id` — the basis of webhook idempotency. |
| `backend_logs`         | Structured application events (`event_type`, `severity`, `message`, `metadata`, `user_id`) surfaced through the admin log viewer. |

A Postgres RPC function, `reserve_appointment_slot(p_slot_id, p_centre_id)`,
performs the slot-capacity check, increment and queue-number assignment as
a single atomic database operation, so concurrent bookings against the
same slot can't oversell its capacity.

## 4. Authentication & Authorization

- Signup, login, and email verification are handled by Supabase Auth.
  `POST /api/auth/login` and `POST /api/auth/signup` return a Supabase
  session containing an `access_token`.
- Every protected route expects `Authorization: Bearer <access_token>`.
  The token is verified against Supabase on each request and resolved to
  the caller's `profiles` row.
- Admin-only routes additionally require `profiles.role = 'ADMIN'`.
- A user can only ever read or act on their **own** bookings and payments;
  bookings belonging to another user resolve as `404 BOOKING_NOT_FOUND`
  rather than `403`, to avoid leaking existence of other users' records.

## 5. Core Workflows

### Booking creation

`POST /api/bookings` re-validates everything server-side rather than
trusting the client:

1. Centre exists and is active.
2. Every submitted `test_id` is offered by that centre, active, and
   available.
3. The slot exists, belongs to that centre, is active, and is in the
   future.
4. The slot's capacity is atomically reserved via `reserve_appointment_slot`,
   which also assigns the caller's `queue_number` for that slot.
5. `total_amount` is computed from each test's **current centre-specific
   price** in the database — the frontend never sends, and the backend
   never trusts, a client-supplied total.
6. The booking is created with status `PENDING`.

### Simulated payment

`POST /api/payments` creates a `PENDING` payment for a `PENDING` booking,
copying `amount` from the booking's stored `total_amount`. Calling it again
for the same booking returns the existing `PENDING` payment instead of
creating a duplicate, and a booking that is already paid is rejected with
`409 BOOKING_ALREADY_PAID`. The actual SUCCESS/FAILED outcome is delivered
asynchronously by the payment webhook, mirroring how a real payment
provider would confirm a transaction out-of-band.

### Idempotent payment webhook

`POST /api/payments/webhook` simulates the payment provider notifying the
backend of a payment outcome:

- Each event carries a unique `event_id`, stored in `webhook_events` under
  a database unique constraint.
- Re-delivering the same `event_id` returns the previously stored result
  without reprocessing it or touching the payment/booking again — the
  operation is fully idempotent at the database level, not just checked
  in application code.
- On first delivery, a success event moves the payment to `SUCCESS` and
  the booking to `CONFIRMED`; a failure event moves the payment to
  `FAILED` and the booking to `FAILED`.
- A payment that has already reached a terminal state (`SUCCESS`/`FAILED`)
  cannot be flipped by a later webhook call for the same payment
  (`409 PAYMENT_STATE_CONFLICT`).

## 6. API Reference

Full request/response bodies, validation rules and error codes for every
endpoint are documented in `API_ENDPOINTS.txt`, and are also available as
interactive Swagger UI at `GET /api-docs` once the server is running. The
table below is a condensed index.

| Method & Path                              | Auth        | Description                                   |
|---------------------------------------------|-------------|------------------------------------------------|
| `GET  /health`                               | —           | Health check                                    |
| `POST /api/auth/signup`                      | —           | Create an account                               |
| `POST /api/auth/login`                       | —           | Log in, returns JWT session                     |
| `POST /api/auth/verify`                      | —           | Verify email OTP                                |
| `POST /api/auth/resend-verification`         | —           | Resend the OTP email                            |
| `GET  /api/auth/me`                          | User        | Current user + profile                          |
| `POST /api/auth/logout`                      | User        | Invalidate session                              |
| `GET  /api/centres`                          | —           | List centres (paginated, searchable)            |
| `GET  /api/centres/:centreId`                | —           | Centre details                                  |
| `GET  /api/centres/:centreId/tests`          | —           | Tests offered by a centre, with price           |
| `GET  /api/centres/:centreId/slots`          | —           | Appointment slots for a centre                  |
| `POST /api/centres`                          | Admin       | Create a centre (auto-generates default slots)  |
| `PATCH /api/centres/:centreId`               | Admin       | Update a centre                                 |
| `POST /api/centres/:centreId/tests`          | Admin       | Attach a test + price to a centre               |
| `GET  /api/tests`                            | —           | List tests                                      |
| `GET  /api/tests/:testId`                    | —           | Test details                                    |
| `GET  /api/tests/:testId/centres`            | —           | Centres offering a given test                   |
| `POST /api/tests`                            | Admin       | Create a test                                   |
| `PATCH /api/tests/:testId`                   | Admin       | Update a test                                   |
| `POST /api/bookings`                         | User        | Create a multi-test booking                     |
| `GET  /api/bookings`                         | User        | List the caller's bookings                      |
| `GET  /api/bookings/:bookingId`               | User        | Booking details                                 |
| `POST /api/bookings/:bookingId/cancel`       | User        | Cancel a `PENDING`/`CONFIRMED` booking           |
| `POST /api/payments`                         | User        | Start a simulated payment for a booking         |
| `GET  /api/payments/:paymentId`              | User        | Payment details                                 |
| `GET  /api/payments/:paymentId/status`       | User        | Poll payment status                             |
| `POST /api/payments/webhook`                 | Provider    | Idempotent payment-status webhook               |
| `GET  /api/logs`                             | Admin       | Structured system event log (paginated)         |

### Example: create a booking

```http
POST /api/bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "centre_id": "b3c1...",
  "slot_id": "9f2a...",
  "patient_name": "John Doe",
  "patient_phone": "9876543210",
  "patient_email": "john@example.com",
  "test_ids": ["t1...", "t2..."]
}
```

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-uuid",
    "total_amount": 900,
    "queue_number": 3,
    "status": "PENDING",
    "booking_tests": [ { "test_name": "CBC", "unit_price": 500, "subtotal": 500 } ]
  }
}
```

### Example: idempotent webhook delivery

```http
POST /api/payments/webhook
Content-Type: application/json

{ "event_id": "event-12345", "event_type": "payment.success", "payment_id": "payment-uuid" }
```

Delivering the exact same body a second time returns
`"data": { "duplicate": true, ... }` and makes no further change to the
payment or booking.

## 7. Validation & Edge-Case Handling

Every request body/query is validated with Zod before it reaches business
logic. Beyond basic shape validation, the API enforces:

- A user cannot book a test that isn't offered (or isn't available) at the
  selected centre.
- A slot cannot be booked in the past, and cannot be over-booked — slot
  capacity is checked and reserved atomically in the database.
- A booking's `total_amount` is always derived from the database, never
  accepted from the client.
- A payment amount is always copied from the booking, never accepted from
  the client.
- Booking status transitions are backend-controlled: a booking can only
  move from `PENDING` to `CONFIRMED`/`FAILED` via the webhook, and only a
  `PENDING`/`CONFIRMED` booking can be cancelled.
- Duplicate webhook events are detected and safely ignored via a database
  unique constraint on `event_id`.
- A payment already in a terminal state cannot be moved to a different
  terminal state by a later webhook call.
- Users cannot read, cancel, or pay for another user's booking.
- Rate limiting is applied to authentication, booking, payment and webhook
  endpoints to reduce abuse.

## 8. Logging

The backend emits structured JSON log events (timestamp, `event_type`,
`severity`, human-readable message, and non-sensitive metadata) for key
actions: `LOGIN_SUCCESS`/`LOGIN_FAILED`, `SIGNUP_SUCCESS`,
`BOOKING_CREATED`/`BOOKING_FAILED`/`BOOKING_CANCELLED`,
`PAYMENT_SUCCESS`/`PAYMENT_FAILED`,
`WEBHOOK_RECEIVED`/`WEBHOOK_PROCESSED`/`WEBHOOK_DUPLICATE`,
`VALIDATION_FAILED`, `UNAUTHORIZED_ACCESS`, `SLOT_UNAVAILABLE`, and more.
Passwords, tokens, OTPs, Supabase keys, and full request bodies are never
logged. `GET /api/logs` (admin-only) exposes these events, paginated, for
the frontend's admin log viewer.

## 9. Testing

```bash
npm test           # Jest + Supertest, run in-band
npm run test:watch
```

Test coverage focuses on the flows called out in the assignment brief:
authentication (signup/login/invalid credentials), centre/test retrieval,
multi-test booking (including empty selection and unavailable-test cases),
slot availability (including a slot becoming full and past-dated
appointments), payment (success, failure, invalid booking, duplicate
attempts), webhook handling (valid, duplicate, invalid event), and
authorization (a user cannot access another user's booking). See
`test/README.md` for the full breakdown.

## 10. Running Locally

See `HOW_TO_RUN.txt` for the complete step-by-step guide. Summary:

```bash
cd backend
npm install
cp .env.example .env    # fill in your own Supabase project values
npm run dev
```

Required environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY`, plus `NODE_ENV`, `PORT`, `FRONTEND_URL`, and
`LOG_LEVEL`. Use your own Supabase project's keys — never commit a `.env`
file or expose the service-role (`SUPABASE_SECRET_KEY`) value to the
frontend.

## 11. Assumptions

- Supabase Auth is used as the identity provider; `profiles` mirrors the
  Supabase `auth.users` table 1:1 and carries the app-specific `role` field.
- The required Postgres tables and the `reserve_appointment_slot` RPC
  function are provisioned directly in the Supabase project for this
  submission, since PostgreSQL/Auth is fully hosted by Supabase and no
  separate database needs to be containerized.
- Prices are attached per centre-test pair (`centre_tests.price`) rather
  than globally on `tests`, since the assignment and product spec both
  describe centre-specific pricing.
- Payment is simulated end-to-end (no real payment gateway); the "provider"
  webhook is called directly to emulate an external payment provider's
  callback.
- Queue numbers are a per-slot sequential position assigned atomically at
  booking time, as an enhancement beyond the base assignment brief.

## 12. Future Improvements

Given more time, the next priorities would be:

- Ship the database schema and the `reserve_appointment_slot` function as
  versioned SQL migrations, so a fresh Supabase project can be provisioned
  with a single command instead of manual setup.
- Add richer filtering (by event type/severity) to the admin log endpoint.
- Add Redis-backed caching for high-read endpoints (centre/test listings).
- Add background-job based retry handling for webhook delivery failures.
- Containerize the backend with Docker/Docker Compose for consistent
  environments across machines.
