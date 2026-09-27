import React from 'react';
import { MapPin, CalendarDays, Clock, User, Hash } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge.jsx';

export default function BookingSummaryCard({ centre, slot, patient, tests, totalAmount, status, queueNumber }) {
  return (
    <div className="rounded-2xl border border-charcoal-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-charcoal-800">{centre?.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-400">
            <MapPin size={14} /> {centre?.location}
          </p>
        </div>
        {status && <StatusBadge status={status} />}
      </div>

      {slot && (
        <div className="mt-4 flex flex-wrap gap-4 border-t border-charcoal-100 pt-4 text-sm text-charcoal-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-charcoal-300" /> {formatDate(slot.appointment_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-charcoal-300" /> {formatTime(slot.start_time)} &ndash; {formatTime(slot.end_time)}
          </span>
        </div>
      )}

      {patient && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-charcoal-600">
          <User size={14} className="text-charcoal-300" /> {patient.patient_name}
        </div>
      )}

      {queueNumber !== undefined && queueNumber !== null && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-charcoal-600">
          <Hash size={14} className="text-charcoal-300" /> Queue number {queueNumber}
        </div>
      )}

      {tests?.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-charcoal-100 pt-4">
          {tests.map((t) => (
            <div key={t.id || t.test_name} className="flex items-center justify-between text-sm">
              <span className="text-charcoal-600">{t.test_name || t.name}</span>
              <span className="font-medium text-charcoal-700">{formatCurrency(t.subtotal ?? t.price)}</span>
            </div>
          ))}
        </div>
      )}

      {totalAmount !== undefined && (
        <div className="mt-4 flex items-center justify-between border-t border-charcoal-100 pt-4 font-semibold text-charcoal-800">
          <span>Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      )}
    </div>
  );
}
