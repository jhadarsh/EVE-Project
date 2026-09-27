import React from 'react';
import { cn } from '../../utils/cn';

const STYLES = {
  PENDING: 'bg-warning-50 text-warning-600',
  CONFIRMED: 'bg-success-50 text-success-600',
  SUCCESS: 'bg-success-50 text-success-600',
  FAILED: 'bg-danger-50 text-danger-600',
  CANCELLED: 'bg-charcoal-100 text-charcoal-500',
};

const LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        STYLES[status] || 'bg-charcoal-100 text-charcoal-500',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  );
}
