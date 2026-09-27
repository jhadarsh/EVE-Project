import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  { label, error, hint, className, id, required, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-charcoal-700">
          {label}
          {required && <span className="text-brand-600"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-charcoal-800 placeholder:text-charcoal-300 transition focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          error ? 'border-danger-500 focus:border-danger-500' : 'border-charcoal-200 focus:border-brand-500',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-danger-500">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-charcoal-400">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
