import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Linkedin,
  QrCode,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import Page from "../components/layout/Page";
import {
  useBooking,
  usePaymentStatus,
  mutations,
} from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { friendlyError } from "../utils/errors";
import Badge from "../components/common/Badge";
import { PageSpinner } from "../components/common/States";
import { apiClient } from "../services/apiClient";

const LINKEDIN_URL =
  "https://www.linkedin.com/in/adarsh-kumar-13a17b2a7/";

const PAYMENT_TIMER_SECONDS = 20;
const SUCCESS_TIMER_SECONDS = 5;

export default function Payment() {
  const { bookingId } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();

  const booking = useBooking(bookingId);
  const create = mutations.createPayment();

  const createdRef = useRef(false);
  const returnedFromLinkedInRef = useRef(false);
  const successRequestRef = useRef(false);

  /*
   * The booking query's `payments` array is only as fresh as its
   * last fetch. When we create a payment ourselves, we capture its
   * id here immediately instead of waiting on booking.data to
   * refresh (it might not, and that used to leave paymentId stuck
   * as undefined forever — which meant the "mark as paid" webhook
   * call below never had an id to send and silently never fired).
   */
  const [createdPaymentId, setCreatedPaymentId] = useState(null);

  /*
   * IMPORTANT:
   *
   * linkedInClicked = user clicked LinkedIn.
   *
   * It is NOT the payment status.
   */
  const [linkedInClicked, setLinkedInClicked] = useState(false);

  /*
   * The first timer starts immediately when the payment page opens.
   */
  const [paymentTimer, setPaymentTimer] = useState(
    PAYMENT_TIMER_SECONDS,
  );

  /*
   * This becomes true only after the user clicks LinkedIn
   * and then comes back to this payment page.
   */
  const [returnedFromLinkedIn, setReturnedFromLinkedIn] =
    useState(false);

  /*
   * Five-second timer after returning from LinkedIn.
   */
  const [successTimer, setSuccessTimer] = useState(
    SUCCESS_TIMER_SECONDS,
  );

  const paymentId =
    createdPaymentId || booking.data?.payments?.[0]?.id;

  /*
   * ============================================
   * CREATE PAYMENT
   * ============================================
   */

  useEffect(() => {
    if (!booking.data || createdRef.current) return;

    const existingPayment = booking.data.payments?.find(
      (payment) =>
        payment.status === "PENDING" ||
        payment.status === "SUCCESS",
    );

    if (existingPayment) {
      createdRef.current = true;
      return;
    }

    createdRef.current = true;

    create.mutate(
      {
        bookingId,
      },
      {
        onSuccess: (response) => {
          // Support either { data: { id } } or a bare payment object,
          // depending on how the API response is shaped.
          const created =
            response?.data?.data || response?.data || response;
          if (created?.id) {
            setCreatedPaymentId(created.id);
          }
        },
        onError: (error) => {
          toast(friendlyError(error), "error");
        },
      },
    );
  }, [booking.data, bookingId, create, toast]);

  /*
   * ============================================
   * PAYMENT STATUS POLLING
   * ============================================
   *
   * This asks your backend for the real status.
   *
   * PENDING -> keep polling
   * SUCCESS -> stop polling
   * FAILED  -> stop polling
   */

  const paymentStatusQuery = usePaymentStatus(paymentId);

  const payment =
    paymentStatusQuery.data?.data ||
    booking.data?.payments?.[0];

  const paymentStatus = payment?.status || "PENDING";

  /*
   * ============================================
   * 20 SECOND INITIAL TIMER
   * ============================================
   *
   * IMPORTANT:
   *
   * This timer starts as soon as Payment.jsx opens.
   *
   * It stops permanently when LinkedIn is clicked.
   */

  useEffect(() => {
    // LinkedIn was clicked, so the initial timer must stop.
    if (linkedInClicked) return;

    // If payment timer reaches zero:
    // redirect to profile.
    //
    // Payment is NOT changed to SUCCESS.
    if (paymentTimer <= 0) {
      nav("/profile");
      return;
    }

    const timer = setTimeout(() => {
      setPaymentTimer((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [paymentTimer, linkedInClicked, nav]);

  /*
   * ============================================
   * OPEN LINKEDIN
   * ============================================
   *
   * Clicking LinkedIn:
   *
   * 1. Stops the 20 second timer.
   * 2. Opens LinkedIn.
   * 3. We wait for the user to return.
   */

  const handleLinkedInClick = () => {
    // Stop the 20 second timer.
    setLinkedInClicked(true);

    // Reset the return state.
    setReturnedFromLinkedIn(false);

    // Open LinkedIn in a new tab.
    window.open(
      LINKEDIN_URL,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /*
   * ============================================
   * DETECT RETURN FROM LINKEDIN
   * ============================================
   *
   * We only listen after LinkedIn was clicked.
   *
   * When the user comes back to this payment tab:
   *
   * returnedFromLinkedIn = true
   *
   * Then the 5 second timer starts.
   */

  useEffect(() => {
    if (!linkedInClicked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (returnedFromLinkedInRef.current) {
        return;
      }

      returnedFromLinkedInRef.current = true;

      setReturnedFromLinkedIn(true);
      setSuccessTimer(SUCCESS_TIMER_SECONDS);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    /*
     * Also listen for the window becoming active.
     * This helps with browsers where visibilitychange
     * is not fired consistently for a new tab.
     */
    const handleFocus = () => {
      if (returnedFromLinkedInRef.current) {
        return;
      }

      returnedFromLinkedInRef.current = true;

      setReturnedFromLinkedIn(true);
      setSuccessTimer(SUCCESS_TIMER_SECONDS);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener("focus", handleFocus);
    };
  }, [linkedInClicked]);

  /*
   * ============================================
   * SIMULATE PAYMENT SUCCESS
   * ============================================
   *
   * Once the user has returned from LinkedIn,
   * tell the backend that the simulated provider
   * has completed the payment.
   *
   * IMPORTANT:
   *
   * We do NOT locally change paymentStatus to SUCCESS.
   *
   * The backend remains the source of truth.
   */

  useEffect(() => {
    if (!returnedFromLinkedIn) return;

    if (!paymentId) return;

    if (successRequestRef.current) return;

    successRequestRef.current = true;

    

    const simulateSuccess = async () => {
      try {
        await apiClient.post("/payments/webhook", {
          event_id: `SIM-${paymentId}-${Date.now()}`,
          event_type: "payment.success",
          payment_id: paymentId,
          payload: {
            source: "linkedin-simulation",
          },
        });

        /*
         * Don't just wait for the next poll tick — refetch right
         * away so the SUCCESS state (and the "View confirmation"
         * screen) can show up before the 5 second redirect timer
         * runs out.
         */
        paymentStatusQuery.refetch?.();
      } catch (error) {
        console.error(
          "Payment simulation failed:",
          error,
        );

        successRequestRef.current = false;

        toast(
          "Payment confirmation failed. Please try again.",
          "error",
        );
      }
    };

    simulateSuccess();
  }, [returnedFromLinkedIn, paymentId, toast]);


  /*
   * ============================================
   * 5 SECOND TIMER AFTER RETURNING
   * ============================================
   *
   * User:
   *
   * Payment page
   *      ↓
   * Click LinkedIn
   *      ↓
   * LinkedIn
   *      ↓
   * Return
   *      ↓
   * 5 seconds
   *      ↓
   * Profile
   */

  useEffect(() => {
    if (!returnedFromLinkedIn) return;

    if (successTimer <= 0) {
      nav("/profile");
      return;
    }

    const timer = setTimeout(() => {
      setSuccessTimer((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [returnedFromLinkedIn, successTimer, nav]);

  /*
   * ============================================
   * LOADING
   * ============================================
   */

  if (booking.isLoading) {
    return <PageSpinner />;
  }

  /*
   * ============================================
   * BOOKING ERROR
   * ============================================
   */

  if (booking.isError || !booking.data) {
    return (
      <Page>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <XCircle
              size={42}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Booking not found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              We could not load the booking associated with this
              payment.
            </p>
          </div>
        </div>
      </Page>
    );
  }

  /*
   * ============================================
   * MAIN UI
   * ============================================
   */

  return (
    <Page>
      <div className="mx-auto max-w-2xl pb-10">
        {/* Header */}
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
            Secure payment
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
            Complete your payment
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-gray-500">
            Complete the simulated payment before the session
            expires.
          </p>
        </div>

        {/* Payment Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Amount Header */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-5 text-white sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                  Booking amount
                </p>

                <p className="mt-1 text-2xl font-extrabold">
                  ₹
                  {Number(
                    booking.data.total_amount,
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <Badge status={paymentStatus} />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* ================================= */}
            {/* PAYMENT SUCCESS */}
            {/* ================================= */}

            {paymentStatus === "SUCCESS" ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2
                    size={32}
                    className="text-green-600"
                  />
                </div>

                <h2 className="mt-4 text-xl font-extrabold text-gray-900">
                  Payment successful
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Your payment has been confirmed successfully.
                </p>

                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <p className="text-xs font-medium text-green-700">
                    Redirecting to your profile in
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-green-700">
                    {successTimer}s
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Reference
                    </span>

                    <span className="font-semibold text-gray-900">
                      {payment?.payment_reference || "—"}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Queue number
                    </span>

                    <span className="font-semibold text-gray-900">
                      {booking.data.queue_number ?? "—"}
                    </span>
                  </div>
                </div>

                <Link
                  className="btn-primary mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm"
                  to={`/booking/success/${bookingId}`}
                >
                  View confirmation
                </Link>
              </div>
            ) : paymentStatus === "FAILED" ? (
              /* ================================= */
              /* PAYMENT FAILED */
              /* ================================= */

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <XCircle
                    size={32}
                    className="text-red-600"
                  />
                </div>

                <h2 className="mt-4 text-xl font-extrabold text-gray-900">
                  Payment failed
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  The payment could not be completed.
                </p>

                <button
                  type="button"
                  className="btn-secondary mt-5 h-10 rounded-xl px-5 text-sm"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try again
                </button>
              </div>
            ) : returnedFromLinkedIn ? (
              /* ================================= */
              /* RETURNED FROM LINKEDIN */
              /* ================================= */

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2
                    size={32}
                    className="text-green-600"
                  />
                </div>

                <h2 className="mt-4 text-xl font-extrabold text-gray-900">
                  Payment received
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  We are confirming your payment.
                </p>

                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-green-100 bg-green-50 px-4 py-4">
                  <p className="text-xs font-medium text-green-700">
                    Redirecting in
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-green-700">
                    {successTimer}s
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <RefreshCcw
                    size={13}
                    className="animate-spin"
                  />

                  Confirming payment...
                </div>
              </div>
            ) : linkedInClicked ? (
              /* ================================= */
              /* LINKEDIN OPENED */
              /* ================================= */

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                  <Linkedin
                    size={30}
                    className="text-brand-600"
                  />
                </div>

                <h2 className="mt-4 text-xl font-extrabold text-gray-900">
                  LinkedIn opened
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Complete the action in the LinkedIn tab, then
                  return to this payment page.
                </p>

                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-brand-100 bg-brand-50 px-4 py-4">
                  <p className="text-xs font-medium text-brand-700">
                    Waiting for you to return
                  </p>

                  <p className="mt-2 text-sm font-semibold text-brand-700">
                    Return to this payment page
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <RefreshCcw
                    size={13}
                    className="animate-spin"
                  />

                  Waiting for return...
                </div>
              </div>
            ) : (
              /* ================================= */
              /* INITIAL PAYMENT PAGE */
              /* ================================= */

              <div>
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                    <QrCode
                      size={25}
                      className="text-brand-600"
                    />
                  </div>

                  <h2 className="mt-4 text-xl font-extrabold text-gray-900">
                    Scan to complete payment
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Use the QR code or click the LinkedIn button
                    below.
                  </p>
                </div>

                {/* QR */}
                <div className="mx-auto mt-6 flex w-fit rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    value={LINKEDIN_URL}
                    size={190}
                    level="H"
                    includeMargin
                  />
                </div>

                {/* 20 second timer */}
                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <Clock3 size={16} />

                    <span className="text-xs font-semibold">
                      Payment session expires in
                    </span>
                  </div>

                  <p className="mt-1 text-3xl font-extrabold text-amber-700">
                    {paymentTimer}s
                  </p>

                  <p className="mt-1 text-[11px] text-amber-600">
                    If you don't open LinkedIn before the timer
                    ends, you'll be redirected to your profile and
                    payment will remain pending.
                  </p>
                </div>

                {/* LinkedIn Button */}
                <button
                  type="button"
                  onClick={handleLinkedInClick}
                  className="mx-auto mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  <ExternalLink size={15} />
                  Open LinkedIn
                </button>

                <p className="mt-3 text-center text-[11px] text-gray-400">
                  Click LinkedIn before the 20 second timer expires.
                </p>

                {payment?.payment_reference && (
                  <p className="mt-5 text-center text-[11px] text-gray-400">
                    Payment reference:{" "}
                    {payment.payment_reference}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}