// Enumerations mirrored exactly from the EVE Healthcare backend API documentation.
// These are display/logic helpers only — the backend remains the source of truth
// for what status a resource is actually in.

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const BOOKING_STATUS_LABEL = {
  PENDING: 'Pending payment',
  CONFIRMED: 'Confirmed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

// Bookings can only be cancelled from these statuses (section 6.4 of the API docs).
export const CANCELLABLE_BOOKING_STATUSES = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED];

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

// Keys used by TanStack React Query. Centralised so invalidation stays consistent.
export const QUERY_KEYS = {
  currentUser: ['auth', 'me'],
  centres: (params) => ['centres', params],
  centre: (id) => ['centres', id],
  centreTests: (id, params) => ['centres', id, 'tests', params],
  centreSlots: (id, params) => ['centres', id, 'slots', params],
  tests: (params) => ['tests', params],
  test: (id) => ['tests', id],
  bookings: (params) => ['bookings', params],
  booking: (id) => ['bookings', id],
  payment: (id) => ['payments', id],
  paymentStatus: (id) => ['payments', id, 'status'],
  adminLogs: (params) => ['admin', 'logs', params],
};

export const SESSION_STORAGE_KEYS = {
  pendingBooking: 'eve_pending_booking_selection',
  accessToken: 'eve_access_token',
  refreshToken: 'eve_refresh_token',
};

export const DEFAULT_PAGE_SIZE = 10;
