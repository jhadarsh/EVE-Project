import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { useBooking } from '../hooks/useBookings';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Button from '../components/common/Button.jsx';

export default function BookingFailedPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const query = useBooking(bookingId);
  const booking = query.data?.data;

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
        <ErrorState error={query.error} onRetry={query.refetch} />
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <XCircle size={32} />
        </div>
        <h1 className="text-xl font-bold text-charcoal-800 sm:text-2xl">Payment didn't go through</h1>
        <p className="mt-1.5 text-sm text-charcoal-400">
          Your booking wasn't confirmed. No amount was charged for the failed attempt.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button as={Link} to="/" variant="outline">
            Back to home
          </Button>
          <Button onClick={() => navigate(`/payment/${booking.id}`)}>Retry payment</Button>
        </div>
      </motion.div>
    </div>
  );
}
