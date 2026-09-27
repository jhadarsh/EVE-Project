import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBooking, useCancelBooking } from '../hooks/useBookings';
import { useToast } from '../context/ToastContext.jsx';
import BookingSummaryCard from '../components/booking/BookingSummaryCard.jsx';
import ConfirmationDialog from '../components/common/ConfirmationDialog.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Button from '../components/common/Button.jsx';
import { CANCELLABLE_BOOKING_STATUSES } from '../constants';
import { ApiError } from '../services/apiClient';

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const toast = useToast();
  const query = useBooking(bookingId);
  const cancelBooking = useCancelBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const booking = query.data?.data;

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync({ bookingId });
      toast.success('Booking cancelled');
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not cancel the booking.');
    }
  };

  if (query.isLoading) {
    return (
      <div className="container-page py-16">
        <Spinner />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="container-page py-16">
        <ErrorState error={query.error} onRetry={query.refetch} title="Booking not found" />
      </div>
    );
  }

  const canCancel = CANCELLABLE_BOOKING_STATUSES.includes(booking.status);

  return (
    <div className="container-page py-10">
      <Link to="/profile" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-charcoal-800">
        <ArrowLeft size={15} /> Back to profile
      </Link>

      <h1 className="text-xl font-bold text-charcoal-800 sm:text-2xl">
        Booking #{booking.queue_number ?? booking.id.slice(0, 8)}
      </h1>

      <div className="mt-6 max-w-lg">
        <BookingSummaryCard
          centre={booking.diagnostic_centres}
          slot={booking.appointment_slots}
          patient={{ patient_name: booking.patient_name }}
          tests={booking.booking_tests}
          totalAmount={booking.total_amount}
          status={booking.status}
          queueNumber={booking.queue_number}
        />

        {canCancel && (
          <Button variant="danger" className="mt-5" onClick={() => setConfirmOpen(true)}>
            Cancel booking
          </Button>
        )}
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this booking?"
        description="This can't be undone. Your appointment slot will be released."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        loading={cancelBooking.isPending}
      />
    </div>
  );
}
