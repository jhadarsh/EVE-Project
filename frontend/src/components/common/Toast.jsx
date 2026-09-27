import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  default: Info,
};

const STYLES = {
  success: 'bg-success-50 text-success-600 border-success-500/20',
  error: 'bg-danger-50 text-danger-600 border-danger-500/20',
  warning: 'bg-warning-50 text-warning-600 border-warning-500/20',
  default: 'bg-white text-charcoal-700 border-charcoal-100',
};

export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-6 sm:items-end sm:pr-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant] || ICONS.default;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lifted',
                STYLES[t.variant] || STYLES.default
              )}
              role="status"
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-full p-0.5 opacity-60 transition hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
