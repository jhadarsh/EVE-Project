import React, { useMemo, useState } from 'react';
import { format, addDays } from 'date-fns';
import { useCentreSlots } from '../../hooks/useCentres';
import { ListSkeleton } from '../common/Skeletons.jsx';
import ErrorState from '../common/ErrorState.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatTime } from '../../utils/formatters';
import { CalendarX2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const DATE_OPTIONS = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

export default function DateSlotPicker({ centreId, selectedSlot, onSelectSlot }) {
  const [date, setDate] = useState(format(DATE_OPTIONS[0], 'yyyy-MM-dd'));
  const params = useMemo(() => ({ date, limit: 50 }), [date]);
  const query = useCentreSlots(centreId, params);

  const slots = query.data?.data || [];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {DATE_OPTIONS.map((d) => {
          const value = format(d, 'yyyy-MM-dd');
          const active = value === date;
          return (
            <button
              key={value}
              onClick={() => setDate(value)}
              className={cn(
                'flex shrink-0 flex-col items-center rounded-2xl border px-4 py-2.5 text-sm transition',
                active ? 'border-brand-600 bg-brand-600 text-white' : 'border-charcoal-200 bg-white text-charcoal-600 hover:border-charcoal-300'
              )}
            >
              <span className="font-semibold">{format(d, 'dd MMM')}</span>
              <span className={cn('text-xs', active ? 'text-white/80' : 'text-charcoal-400')}>{format(d, 'EEE')}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {query.isLoading && <ListSkeleton count={3} />}
        {query.isError && <ErrorState error={query.error} onRetry={query.refetch} />}
        {query.isSuccess && slots.length === 0 && (
          <EmptyState icon={CalendarX2} title="No appointment slots available" description="Try a different date." />
        )}
        {query.isSuccess && slots.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {slots.map((slot) => {
              const full = slot.booked_count >= slot.capacity;
              const active = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  disabled={full}
                  onClick={() => onSelectSlot(slot)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                    full && 'cursor-not-allowed border-charcoal-100 bg-charcoal-50 text-charcoal-300 line-through',
                    !full && active && 'border-brand-600 bg-brand-600 text-white',
                    !full && !active && 'border-charcoal-200 bg-white text-charcoal-700 hover:border-brand-400'
                  )}
                >
                  {formatTime(slot.start_time)} &ndash; {formatTime(slot.end_time)}
                  {!full && (
                    <span className={cn('mt-0.5 block text-xs', active ? 'text-white/80' : 'text-charcoal-400')}>
                      {slot.capacity - slot.booked_count} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
