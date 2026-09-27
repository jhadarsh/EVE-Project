# EVE Healthcare — Diagnostic Test Booking Platform

A full-stack diagnostic test booking application built as the EVE Healthcare
SDE Intern backend engineering assignment, extended with a complete React
frontend to demonstrate the API end-to-end.

---

## Problem Statement

Diagnostic labs typically require patients to call or walk in to check test
availability, prices and appointment slots, with no self-service way to
book a test, pay for it, and get a confirmed appointment online. The
assignment asked for a backend service that lets a user browse diagnostic
centres and tests, book an appointment, pay through a **simulated** payment
flow, and have that payment status delivered back to the backend through an
**idempotent webhook** — while correctly handling authentication,
authorization, and real-world edge cases (invalid input, duplicate webhook
events, race conditions on slot capacity, unauthorized access, etc.).

## Solution Overview

EVE Healthcare implements the full flow as a small, production-shaped
system:

- **Backend** — Node.js + Express REST API, using Supabase (PostgreSQL +
  Auth) for data storage and JWT-based authentication. Handles centre/test
  catalogue management, multi-test bookings, atomic appointment-slot
  reservation with queue numbers, simulated payments, an idempotent payment
  webhook, structured logging, and admin-only management endpoints.
- **Frontend** — React + Vite single-page app that lets a user browse
  centres and tests without an account, select one or more tests, sign
  up/log in only when they're ready to book, walk through slot selection,
  patient details and a review step, pay through a simulated payment
  screen, and view their bookings, queue number and payment history from a
  profile page. A separate admin area manages centres, tests and system
  logs.
- **Database** — PostgreSQL (hosted on Supabase), modeled so that one
  booking can contain multiple selected tests, and every price/total is
  computed server-side, never trusted from the client.

The result covers every required item in the assignment brief (auth,
centre/test catalogue, bookings, simulated payment, idempotent webhook,
edge-case handling, tests, docs) plus several of the listed optional
bonuses (Swagger/OpenAPI docs, structured logging, pagination, rate
limiting) and a complete UI on top of the API.

---

## Repository Structure

```text
EVE-healthcare/
│
├── README.md                 ← you are here (project overview)
│
├── backend/
│   ├── README.md              ← backend architecture, data model, API reference
│   ├── HOW_TO_RUN.txt         ← step-by-step local setup for the backend
│   ├── API_ENDPOINTS.txt      ← full endpoint-by-endpoint reference
│   ├── src/
│   └── test/
│
├── frontend/
│   ├── README.md               ← frontend architecture & API integration
│   ├── HOW_TO_RUN.txt          ← step-by-step local setup for the frontend
│   └── src/
│
└── docs/
    └── USER_FLOW.md            ← full walkthrough of the end-to-end user journey
```

## Where To Look

| I want to...                                         | Go to                          |
|-------------------------------------------------------|---------------------------------|
| Run the backend locally                                | `backend/HOW_TO_RUN.txt`        |
| Understand the API, database schema and architecture   | `backend/README.md`             |
| Look up a specific endpoint's request/response shape   | `backend/API_ENDPOINTS.txt`     |
| Run the frontend locally                               | `frontend/HOW_TO_RUN.txt`       |
| Understand the frontend architecture and API usage     | `frontend/README.md`            |
| Walk through the full user journey screen-by-screen    | `docs/USER_FLOW.md`             |

---

## Tech Stack

| Layer          | Technology                                                        |
|----------------|--------------------------------------------------------------------|
| Frontend       | React 19, Vite, Tailwind CSS, Framer Motion, TanStack React Query, React Hook Form + Zod, React Router |
| Backend        | Node.js, Express 5, Zod (validation), Helmet, express-rate-limit  |
| Database/Auth  | Supabase (PostgreSQL + Auth, JWT, email verification)             |
| Docs & Testing | Swagger/OpenAPI, Jest + Supertest                                 |

## Quick Start

```bash
# Backend
cd backend && npm install && npm run dev      # see backend/HOW_TO_RUN.txt

# Frontend (in a second terminal)
cd frontend && npm install && npm run dev     # see frontend/HOW_TO_RUN.txt
```

## Key Features

- Public browsing of diagnostic centres and tests (no login required)
- Multi-test selection with a running total calculated by the backend
- JWT authentication via Supabase Auth, with email verification
- Booking created as `PENDING`, with atomic appointment-slot reservation
  and an assigned queue number
- Simulated payment endpoint producing `SUCCESS`/`FAILED`
- Idempotent payment webhook that safely ignores duplicate events
- Booking states: `PENDING → CONFIRMED / FAILED`, cancellable to `CANCELLED`
- Role-based admin endpoints for managing centres, tests and viewing
  system logs
- Structured backend logging with a dedicated admin log viewer
- Swagger/OpenAPI documentation, pagination and rate limiting
- for admin acess use email:- adarshworkjha@gmail.com
- and password:- test@123

For full detail on any of the above, see `backend/README.md`,
`frontend/README.md` and `docs/USER_FLOW.md`.
