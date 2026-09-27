import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function BookingListItem({ booking }) {
  return (
    <Link
      to={`/profile/bookings/${booking.id}`}
      className="flex items-center gap-4 rounded-2xl border border-charcoal-100 bg-white p-4 transition hover:border-brand-200 hover:shadow-soft"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-semibold text-charcoal-800">Booking #{booking.queue_number ?? booking.id.slice(0, 8)}</h4>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-400">
          <span className="flex items-center gap-1">
            <CalendarDays size={13} /> {formatDate(booking.created_at)}
          </span>
          {booking.booking_tests?.length > 0 && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {booking.booking_tests.length} test{booking.booking_tests.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-charcoal-800">{formatCurrency(booking.total_amount)}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-charcoal-300" />
    </Link>
  );
}
