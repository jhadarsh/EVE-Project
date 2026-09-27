# API integration coverage

This frontend uses only endpoints documented in the supplied API contract.

## Public
- GET /health (backend health is not needed for normal UI routing)
- GET /api/centres
- GET /api/centres/:centreId
- GET /api/centres/:centreId/tests
- GET /api/centres/:centreId/slots
- GET /api/tests
- GET /api/tests/:testId

## Auth
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/verify
- POST /api/auth/resend-verification
- GET /api/auth/me
- POST /api/auth/logout

## User
- POST /api/bookings
- GET /api/bookings
- GET /api/bookings/:bookingId
- POST /api/bookings/:bookingId/cancel
- POST /api/payments
- GET /api/payments/:paymentId
- GET /api/payments/:paymentId/status

## Admin
- POST /api/centres
- PATCH /api/centres/:centreId
- POST /api/tests
- PATCH /api/tests/:testId
- GET /api/logs

The documented POST /api/payments/webhook is intentionally not called by the browser: it is an unauthenticated backend/provider webhook endpoint. The payment UI polls the documented payment-status endpoint instead.
