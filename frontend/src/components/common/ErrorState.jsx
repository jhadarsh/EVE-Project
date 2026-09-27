import React from 'react';
import { AlertTriangle, RefreshCcw, WifiOff } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({ error, onRetry, title }) {
  const isNetwork = error?.isNetworkError;
  const message = error?.message || 'Something went wrong. Please try again.';

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-danger-500/15 bg-danger-50/40 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        {isNetwork ? <WifiOff size={22} /> : <AlertTriangle size={22} />}
      </div>
      <h3 className="text-base font-semibold text-charcoal-700">{title || (isNetwork ? 'Connection problem' : 'Something went wrong')}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-charcoal-500">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCcw size={14} />
          Try again
        </Button>
      )}
    </div>
  );
}
