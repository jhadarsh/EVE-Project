import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import Page from "../components/layout/Page";
import { useBooking } from "../hooks/useApi";
import { PageSpinner } from "../components/common/States";
export default function PaymentResult({ failed = false }) {
  const { bookingId } = useParams();
  const q = useBooking(bookingId);
  if (q.isLoading) return <PageSpinner />;
  const b = q.data;
  return (
    <Page>
      <div className="mx-auto max-w-xl text-center panel p-8 sm:p-12">
        {failed ? (
          <XCircle className="mx-auto text-red-500" size={56} />
        ) : (
          <CheckCircle2 className="mx-auto text-green-600" size={56} />
        )}
        <h1 className="mt-5 text-3xl font-extrabold">
          {failed ? "Payment failed" : "Booking confirmed"}
        </h1>
        <p className="mt-3 text-gray-500">
          {failed
            ? "The backend reports a failed payment."
            : "Your payment and booking state are confirmed by the backend."}
        </p>
        {b && (
          <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-left text-sm">
            <p>
              <b>Booking:</b> {b.id}
            </p>
            <p className="mt-2">
              <b>Status:</b> {b.status}
            </p>
            <p className="mt-2">
              <b>Amount:</b> ₹{Number(b.total_amount).toLocaleString("en-IN")}
            </p>
            <p className="mt-2">
              <b>Queue:</b> {b.queue_number ?? "—"}
            </p>
          </div>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link className="btn-primary" to={`/profile/bookings/${bookingId}`}>
            View booking
          </Link>
          <Link className="btn-secondary" to="/">
            Discover more centres
          </Link>
        </div>
      </div>
    </Page>
  );
}
