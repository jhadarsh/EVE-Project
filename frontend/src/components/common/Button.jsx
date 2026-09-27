import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300 shadow-soft',
  secondary: 'bg-charcoal-800 text-white hover:bg-charcoal-700 disabled:bg-charcoal-300',
  outline: 'border border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50 disabled:text-charcoal-300',
  ghost: 'text-charcoal-600 hover:bg-charcoal-50 disabled:text-charcoal-300',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 disabled:bg-danger-500/40',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-sm rounded-full',
  md: 'px-5 py-2.5 text-sm rounded-full',
  lg: 'px-6 py-3 text-base rounded-full',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </Component>
  );
}
