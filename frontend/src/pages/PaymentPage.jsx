import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBookings';
import { useCreatePayment, usePaymentStatus } from '../hooks/usePayments';
import { useToast } from '../context/ToastContext.jsx';
import BookingSummaryCard from '../components/booking/BookingSummaryCard.jsx';
import PaymentStatusView from '../components/payment/PaymentStatusView.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Button from '../components/common/Button.jsx';
import { PAYMENT_STATUS, BOOKING_STATUS } from '../constants';
import { ApiError } from '../services/apiClient';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const bookingQuery = useBooking(bookingId);
  const createPayment = useCreatePayment();
  const [paymentId, setPaymentId] = useState(null);
  const [initError, setInitError] = useState(null);

  const booking = bookingQuery.data?.data;

  // Kick off (or resume) a simulated payment once the booking has loaded.
  useEffect(() => {
    if (!booking || paymentId) return;

    if (booking.status !== BOOKING_STATUS.PENDING) {
      // Already resolved — no payment to create.
      return;
    }

    const existingPayment = booking.payments?.[0];
    if (existingPayment) {
      setPaymentId(existingPayment.id);
      return;
    }

    createPayment.mutate(booking.id, {
      onSuccess: (res) => setPaymentId(res.data.id),
      onError: (err) => setInitError(err instanceof ApiError ? err.message : 'Could not start the payment.'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, paymentId]);

  const statusQuery = usePaymentStatus(paymentId);
  const payment = statusQuery.data?.data;

  useEffect(() => {
    if (payment?.status === PAYMENT_STATUS.SUCCESS) {
      toast.success('Payment confirmed');
      navigate(`/booking/success/${bookingId}`, { replace: true });
    } else if (payment?.status === PAYMENT_STATUS.FAILED) {
      toast.error('Payment failed');
      navigate(`/booking/failed/${bookingId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.status]);

  if (bookingQuery.isLoading) {
    return (
      <div className="container-page py-16">
        <Spinner />
      </div>
    );
  }

  if (bookingQuery.isError) {
    return (
      <div className="container-page py-16">
        <ErrorState error={bookingQuery.error} onRetry={bookingQuery.refetch} title="Booking not found" />
      </div>
    );
  }

  // Booking already resolved outside the pending payment loop (e.g. re-visited page).
  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    return <Navigate to={`/booking/success/${booking.id}`} replace />;
  }

  if (booking.status === BOOKING_STATUS.FAILED) {
    return <Navigate to={`/booking/failed/${booking.id}`} replace />;
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Booking cancelled"
          error={{ message: 'This booking was cancelled and can no longer be paid for.' }}
          onRetry={() => navigate('/profile')}
        />
      </div>
    );
  }

  if (initError) {
    return (
      <div className="container-page py-16">
        <ErrorState error={{ message: initError }} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-xl font-bold text-charcoal-800 sm:text-2xl">Payment</h1>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-charcoal-100 bg-white p-6 shadow-soft">
          {!payment || statusQuery.isLoading ? (
            <Spinner />
          ) : (
            <PaymentStatusView
              status={payment.status}
              amount={payment.amount}
              reference={payment.payment_reference}
              onViewBooking={() => navigate(`/profile/bookings/${booking.id}`)}
              onRetry={
                payment.status === PAYMENT_STATUS.FAILED
                  ? () => {
                      setPaymentId(null);
                    }
                  : undefined
              }
            />
          )}
        </div>
        <BookingSummaryCard
          centre={{ name: '—', location: '' }}
          tests={booking.booking_tests}
          totalAmount={booking.total_amount}
          status={booking.status}
          queueNumber={booking.queue_number}
        />
      </div>
    </div>
  );
}
