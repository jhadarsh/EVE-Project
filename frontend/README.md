# EVE Healthcare — Frontend

A React + Vite single-page application implementing the complete user
journey for the EVE Healthcare diagnostic test booking platform: browsing
centres and tests, multi-test selection, authentication, appointment
booking, a simulated payment step, a profile with booking/queue history,
and an admin panel for managing centres, tests and system logs.

For step-by-step setup, see `HOW_TO_RUN.txt`.
For the full end-to-end user journey, see `../docs/USER_FLOW.md`.

---

## 1. Tech Stack

| Purpose               | Package                          |
|-------------------------|-----------------------------------|
| UI framework             | React 19 + Vite                  |
| Styling                  | Tailwind CSS                     |
| Animation                | Framer Motion                    |
| Server state / caching   | TanStack React Query             |
| HTTP client              | Axios                            |
| Forms & validation       | React Hook Form + Zod            |
| Routing                  | React Router                     |
| Icons                    | Lucide React                     |
| Payment QR (simulated)   | qrcode.react                     |

## 2. Architecture

```text
src/
├── pages/          # One component per route (see Routes below)
├── components/      # Reusable UI, grouped by feature (centres, tests,
│                     booking, payment, profile, admin, common, layout)
├── context/          # AuthContext, BookingContext, ToastContext
├── hooks/            # React Query hooks wrapping each services/*Api module
├── services/         # Thin Axios wrappers per API resource (centres,
│                     tests, bookings, payments, logs, auth)
├── validators/        # Zod schemas mirroring the backend's validation rules
├── routes/            # ProtectedRoute / AdminRoute guards + route table
└── utils/             # Formatters, storage helpers, error normalization
```

- **`AuthContext`** holds the current Supabase session/profile and exposes
  `login`, `signup`, `logout`; the access token is attached to every
  authenticated request by `services/apiClient.js`.
- **`BookingContext`** holds the in-progress booking selection (centre,
  selected tests, chosen slot, patient details) as the user moves through
  the multi-step flow, before anything is sent to the backend.
- **`ProtectedRoute`** redirects an unauthenticated user to `/login`,
  preserving where they were headed so they land back on the same step
  after logging in. **`AdminRoute`** additionally requires
  `profile.role === "ADMIN"`.
- The frontend never computes or sends a final booking total or payment
  amount — every price shown before booking is informational, and the
  authoritative amount always comes back from the backend response.

## 3. Routes

| Path                                   | Access    | Page                                             |
|------------------------------------------|-----------|----------------------------------------------------|
| `/`                                       | Public    | Browse diagnostic centres                          |
| `/centres/:centreId`                      | Public    | Centre details, test selection                     |
| `/login`, `/signup`, `/verify-email`      | Public    | Authentication + email verification                |
| `/booking`                                | User      | Slot selection → patient details → review & confirm |
| `/payment/:bookingId`                     | User      | Simulated payment                                  |
| `/booking/success/:bookingId`             | User      | Booking confirmed                                  |
| `/booking/failed/:bookingId`              | User      | Payment failed                                     |
| `/profile`                                | User      | Personal info, bookings, queue numbers             |
| `/profile/bookings/:bookingId`            | User      | Full booking + payment detail                      |
| `/admin`                                  | Admin     | Overview dashboard                                 |
| `/admin/centres`, `/admin/tests`          | Admin     | Create/update centres and tests                    |
| `/admin/logs`                             | Admin     | System event log viewer                            |

## 4. API Integration

The frontend is built strictly against the documented backend API contract
(see `backend/API_ENDPOINTS.txt`):

- Public browsing (`/api/centres`, `/api/tests`, slot listings) requires no
  token.
- Authenticated requests attach `Authorization: Bearer <access_token>`,
  where the token comes from the backend's login/signup response.
- Admin pages are gated in the UI by `profile.role === "ADMIN"`, but the
  backend independently re-checks the role on every admin request — the
  frontend gate is a UX convenience, not the security boundary.
- Payment creation calls `POST /api/payments` with only `{ booking_id }`.
  The actual `SUCCESS`/`FAILED` outcome is delivered to the backend
  asynchronously by the payment webhook (see below); the payment screen
  reflects whatever status the backend currently reports.

## 5. Payment Simulation UX

Since no real payment gateway is used, the payment screen simulates the
experience of paying and coming back from a provider:

1. The booking's simulated payment is created against the backend
   (`POST /api/payments`).
2. The user is shown a payment screen with a QR code; scanning or clicking
   it opens an external tab (standing in for a payment provider's checkout
   page) and starts a short countdown.
3. When the user returns to the tab, the frontend polls the backend's
   payment-status endpoint (`GET /api/payments/:paymentId/status`).
4. Once the backend's webhook has marked the payment `SUCCESS` or `FAILED`,
   the UI reflects that status and routes to the confirmation or failure
   screen accordingly — the frontend never decides or displays a payment
   result on its own.

## 6. Security Notes

- Only the short-lived access token returned by the backend session is
  stored on the client for authenticated requests.
- Supabase service-role credentials are a **backend-only** secret and are
  never referenced anywhere in this frontend.
- The backend API base URL is read from a single environment variable
  (`VITE_API_BASE_URL`) and is never hardcoded in application source.

## 7. Running Locally

See `HOW_TO_RUN.txt` for the full guide. Summary:

```bash
cd frontend
cp .env.example .env      # set VITE_API_BASE_URL to the backend's URL
npm install
npm run dev
```

The backend (see `../backend/HOW_TO_RUN.txt`) must be running first for
data to load.
