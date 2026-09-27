import React from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import Button from "../common/Button.jsx";
import { PAYMENT_STATUS } from "../../constants";

export default function PaymentStatusView({
  status,
  amount,
  reference,
  onRetry,
  onViewBooking,
}) {
  if (status === PAYMENT_STATUS.PENDING) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500"
        >
          <Loader2 size={30} />
        </motion.div>
        <h2 className="text-lg font-semibold text-charcoal-800">
          Processing your payment
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-charcoal-400">
          Confirming {formatCurrency(amount)} with the payment provider. This
          usually takes a few seconds.
        </p>
        {reference && (
          <p className="mt-3 text-xs text-charcoal-300">
            Reference: {reference}
          </p>
        )}
      </div>
    );
  }

  if (status === PAYMENT_STATUS.SUCCESS) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-10 text-center"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-lg font-semibold text-charcoal-800">
          Payment successful
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-charcoal-400">
          Your booking is confirmed. A summary has been added to your profile.
        </p>
        <Button className="mt-6" onClick={onViewBooking}>
          View booking
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <XCircle size={32} />
      </div>
      <h2 className="text-lg font-semibold text-charcoal-800">
        Payment failed
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-charcoal-400">
        We couldn't confirm this payment. No amount was deducted for a failed
        attempt.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={onViewBooking}>
          View booking
        </Button>
        {onRetry && <Button onClick={onRetry}>Retry payment</Button>}
      </div>
    </div>
  );
}
