import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button.jsx';

function SummaryBody({ selectedTests, onRemove }) {
  return (
    <div className="space-y-2.5">
      {selectedTests.map((t) => (
        <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="truncate text-charcoal-600">{t.name}</span>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-medium text-charcoal-700">{formatCurrency(t.price)}</span>
            <button
              onClick={() => onRemove(t.id)}
              aria-label={`Remove ${t.name}`}
              className="text-charcoal-300 hover:text-danger-500"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TestSelectionSummary({ selectedTests, total, onRemove, onContinue, continueDisabled }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = selectedTests.length;

  return (
    <>
      {/* Desktop sticky sidebar */}
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <div className="rounded-2xl border border-charcoal-100 bg-white p-5 shadow-card">
          <h3 className="font-semibold text-charcoal-800">Selected tests</h3>
          {count === 0 ? (
            <p className="mt-3 text-sm text-charcoal-400">Choose one or more tests to get started.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <SummaryBody selectedTests={selectedTests} onRemove={onRemove} />
              <div className="flex items-center justify-between border-t border-charcoal-100 pt-3 text-sm font-semibold text-charcoal-800">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          )}
          <Button
            className="mt-5 w-full"
            disabled={count === 0 || continueDisabled}
            onClick={onContinue}
          >
            Continue to booking
          </Button>
          <p className="mt-2 text-center text-xs text-charcoal-300">Final price is confirmed by the centre at checkout.</p>
        </div>
      </div>

      {/* Mobile bottom sheet trigger */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal-100 bg-white/95 p-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-charcoal-800 px-4 py-3 text-white"
          >
            <span className="text-sm font-medium">
              {count} test{count > 1 ? 's' : ''} &middot; {formatCurrency(total)}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              View <ChevronUp size={16} />
            </span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal-900/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-white p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-charcoal-800">Selected tests</h3>
                <button onClick={() => setMobileOpen(false)} className="text-charcoal-400">
                  <X size={20} />
                </button>
              </div>
              <SummaryBody selectedTests={selectedTests} onRemove={onRemove} />
              <div className="mt-4 flex items-center justify-between border-t border-charcoal-100 pt-3 text-sm font-semibold text-charcoal-800">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Button
                className="mt-5 w-full"
                disabled={count === 0 || continueDisabled}
                onClick={() => {
                  setMobileOpen(false);
                  onContinue();
                }}
              >
                Continue to booking
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
