import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Spinner({ size = 28, className, label = 'Loading' }) {
  return (
    <div className={cn('flex items-center justify-center py-10', className)} role="status" aria-label={label}>
      <Loader2 size={size} className="animate-spin text-brand-500" />
    </div>
  );
}
