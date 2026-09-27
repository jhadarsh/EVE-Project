# EVE Healthcare — Complete User Flow

This document walks through the full journey a person takes through the
EVE Healthcare platform, from first landing on the site to viewing a
confirmed booking, plus the separate flow available to admin users.

---

## 1. Browsing (no account required)

```text
Home (/)
  │  browse diagnostic centres, no login required
  ▼
Centre Details (/centres/:id)
  │  centre name, location, address, description
  │  available tests shown with description + price
  ▼
Select one or more tests
  │  running summary updates live: selected tests + total
  ▼
Review selection
  │  user can go back and add/remove tests from the same centre
  ▼
Continue to Booking
```

At this stage, nothing has been sent to the backend yet — the selected
centre, tests and running total are held only in the browser (frontend
state) so the user can freely browse and change their mind before
committing to anything.

## 2. Authentication Gate

```text
Continue to Booking
        │
        ▼
   Logged in? ── yes ──▶ Booking Page (/booking)
        │
        no
        │
        ▼
   Login Page (/login)
        │
   ┌────┴────┐
   │         │
 Login     Signup
   │         │
   │      Enter email, password, name, phone
   │         │
   │      Email verification (OTP sent by Supabase)
   │         │
   │      Verify email
   │         │
   └────┬────┘
        ▼
Authentication successful
        │
        ▼
Return automatically to the Booking Page
(the user is not sent back to the home page or made to
 re-select their tests)
```

The user's original destination is preserved through the login redirect,
so completing login or signup after verifying their email drops them
straight back into the booking flow with their test selection intact.

## 3. Booking Page (`/booking`)

The booking flow is presented as a short, guided sequence:

```text
Step 1 — Appointment
  Choose a date and an available slot for the selected centre
  Each slot shows its time, queue position and remaining capacity
  A slot with no remaining capacity is shown as unavailable
        │
        ▼
Step 2 — Patient Details
  Patient name, date of birth, phone, email
        │
        ▼
Step 3 — Review & Confirm
  Final summary: centre, selected tests, slot, patient details, total
  [Confirm booking]
```

On confirm, the backend re-validates everything (centre/tests/slot still
valid and available, price and total computed server-side) and creates the
booking with status **PENDING**, reserving the slot atomically and
assigning the user a queue number for that slot.

## 4. Payment (`/payment/:bookingId`)

```text
Booking created (PENDING)
        │
        ▼
Simulated payment created against the backend
        │
        ▼
Payment screen shown:
  - Order summary (centre, tests, total)
  - QR code
        │
        ▼
User scans/opens the QR code
        │
   opens an external tab standing in for a payment
   provider's checkout (simulated payment demonstration)
        │
        ▼
User completes the simulated action and returns to the tab
        │
        ▼
Frontend polls the backend's payment status
        │
   backend's payment webhook has, independently,
   marked the payment SUCCESS or FAILED
        │
   ┌────┴────┐
   ▼         ▼
SUCCESS   FAILED
```

The frontend never decides a payment's outcome itself — it only reflects
whatever status the backend reports once its webhook has processed the
(simulated) payment provider's callback.

## 5a. Successful Payment

```text
Payment SUCCESS
        │
        ▼
Booking status: PENDING → CONFIRMED
        │
        ▼
Booking Confirmed screen
  Booking ID, centre, selected tests, date, time,
  queue number, total amount
  "A confirmation email has been sent."
  Countdown → redirect to Profile
```

## 5b. Failed Payment

```text
Payment FAILED
        │
        ▼
Booking status: PENDING → FAILED
        │
        ▼
Payment Failed screen
  [Try Again]  [Back to Booking]
```

A failed booking is never shown as confirmed, and its slot capacity/queue
position is released so other users can book it.

## 6. Profile (`/profile`)

```text
Profile
  ├── Personal info: name, email, phone
  │
  └── My Bookings
        each booking shows: tests, centre, date/time,
        status (PENDING / CONFIRMED / FAILED / CANCELLED),
        queue number, total amount
              │
              ▼
     Booking Details modal / page
        Booking info: ID, centre, tests, date, time,
        queue number, status, total
        Payment info: payment ID, status, amount, timestamp,
        payment reference
```

A user can also cancel a `PENDING` or `CONFIRMED` booking from here, which
releases its reserved slot capacity.

## 7. Admin Flow

Separate from the customer-facing flow, a user whose profile role is
`ADMIN` can access an admin area:

```text
Admin Dashboard (/admin)
  overview: total centres, tests, recent log activity
        │
   ┌────┼─────────────┬───────────────┐
   ▼    ▼             ▼               ▼
Centres  Tests      Logs
(/admin/centres) (/admin/tests) (/admin/logs)

Admin → Centres
  Create a new diagnostic centre (name, location, address, description)
  Edit an existing centre, attach tests + prices to it

Admin → Tests
  Create a new diagnostic test (name, description, information)
  Edit an existing test

Admin → Logs
  View structured system events (bookings, payments, webhooks,
  logins, failures) with search and pagination
  No passwords, tokens, OTPs or payment credentials are ever shown
```

Every admin action is re-authorized by the backend independently of the
frontend's UI gating — a non-admin account cannot reach these endpoints
even if it reaches the page.

## 8. End-to-End Summary

```text
HOME → Centre Details → Select Tests → Continue to Booking
   → [Login/Signup + Email Verification if needed] → Booking Page
   → Choose Slot → Patient Details → Review & Confirm
   → Payment (simulated) → SUCCESS or FAILED
   → Booking Confirmed / Payment Failed screen
   → Profile → My Bookings → Booking Details

(Admin, separately) → Admin Dashboard → Centres / Tests / Logs
```
