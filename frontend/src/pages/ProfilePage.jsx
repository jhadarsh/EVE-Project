import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useBookings } from '../hooks/useBookings';
import ProfileHeaderCard from '../components/profile/ProfileHeaderCard.jsx';
import BookingListItem from '../components/profile/BookingListItem.jsx';
import { ListSkeleton } from '../components/common/Skeletons.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import { cn } from '../utils/cn';

const FILTERS = [
  { value: undefined, label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
];

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState(undefined);
  const [page, setPage] = useState(1);

  const params = { page, limit: 10, ...(status ? { status } : {}) };
  const query = useBookings(params);
  const bookings = query.data?.data || [];
  const meta = query.data?.meta;

  return (
    <div className="container-page py-10">
      <ProfileHeaderCard profile={profile} email={user?.email} />

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-charcoal-800">Booking history</h2>
        <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition',
                status === f.value ? 'border-brand-600 bg-brand-600 text-white' : 'border-charcoal-200 bg-white text-charcoal-500 hover:border-charcoal-300'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {query.isLoading && <ListSkeleton count={4} />}
        {query.isError && <ErrorState error={query.error} onRetry={query.refetch} />}
        {query.isSuccess && bookings.length === 0 && (
          <EmptyState icon={CalendarX2} title="No bookings yet" description="Book a diagnostic test to see it here." />
        )}
        {query.isSuccess && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <BookingListItem key={b.id} booking={b} />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={!meta.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={15} /> Previous
            </Button>
            <span className="text-sm text-charcoal-400">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={15} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
