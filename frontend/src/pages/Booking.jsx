 
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";

import Page from "../components/layout/Page";
import BookingStepper from "../components/booking/BookingStepper";
import {
  useCentre,
  useCentreTests,
  useCentreSlots,
  mutations,
} from "../hooks/useApi";
import { bookingSchema } from "../validators/schemas";
import {
  loadBookingDraft,
  clearBookingDraft,
  saveBookingDraft,
} from "../utils/storage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { friendlyError } from "../utils/errors";
import {
  EmptyState,
  LoadingBlock,
} from "../components/common/States";

export default function Booking() {
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [draft] = useState(loadBookingDraft());

  const [step, setStep] = useState(draft?.patient ? 3 : 0);
  const [date, setDate] = useState(draft?.date || "");
  const [slotId, setSlotId] = useState(draft?.slotId || "");
  const [patient, setPatient] = useState(draft?.patient || null);

  const centreId = draft?.centreId;
  const testIds = draft?.testIds || [];

  const centre = useCentre(centreId);
  const tests = useCentreTests(centreId, {
    page: 1,
    limit: 50,
  });

  const slots = useCentreSlots(centreId, {
    date,
    page: 1,
    limit: 50,
  });

  const create = mutations.createBooking();

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: draft?.patient || {},
  });

  useEffect(() => {
    if (!centreId || !testIds.length) {
      nav("/");
    }
  }, [centreId, testIds.length, nav]);

  useEffect(() => {
    if (draft?.patient && isAuthenticated) {
      setPatient(draft.patient);
    }
  }, [draft, isAuthenticated]);

  const selected = useMemo(
    () =>
      (tests.data?.data || []).filter((item) =>
        testIds.includes(item.test_id || item.tests?.id),
      ),
    [tests.data, testIds],
  );

  const submitBooking = async (values) => {
    if (!slotId) {
      toast("Please select an appointment slot first.", "error");
      return;
    }

    if (!isAuthenticated) {
      saveBookingDraft({
        centreId,
        testIds,
        date,
        slotId,
        patient: values,
      });

      nav(`/login?next=${encodeURIComponent("/booking")}`);
      return;
    }

    try {
      const body = {
        centre_id: centreId,
        slot_id: slotId,
        patient_name: values.patient_name,
        patient_phone: values.patient_phone,
        patient_email: values.patient_email,
        test_ids: testIds,
      };

      if (values.patient_dob) {
        body.patient_dob = values.patient_dob;
      }

      const res = await create.mutateAsync(body);

      clearBookingDraft();

      nav(`/payment/${res.data.data.id}`);
    } catch (error) {
      toast(friendlyError(error), "error");
    }
  };

  if (!draft?.centreId || !draft?.testIds?.length) {
    return null;
  }

  return (
    <Page>
      <div className="mx-auto max-w-6xl pb-10">
        {/* Page Header */}
        <div className="mb-5">
          <Link
            to="/"
            className="text-sm font-medium text-gray-500 transition hover:text-brand-600"
          >
            ← Back to centres
          </Link>

          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
              Secure booking
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
              Schedule your diagnostic appointment
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
              Complete the steps below to review your selected tests,
              choose a convenient appointment time, provide the patient
              information, and confirm the booking details before
              proceeding.
            </p>
          </div>
        </div>

        <BookingStepper current={step} />

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          {/* Main Booking Panel */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* STEP 1 */}
            {step === 0 && (
              <div className="p-5 sm:p-6">
                <StepHeader
                  step="Step 1"
                  title="Review your tests"
                  description="Please verify the diagnostic tests selected for this appointment. The prices shown here are provided by the centre for reference and are not treated as the final payable amount."
                />

                <div className="mt-5 space-y-2">
                  {selected.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {item.tests?.name || "Selected test"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Centre-provided reference price
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-bold text-gray-900">
                        ₹
                        {Number(item.price || 0).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3">
                  <p className="text-xs leading-5 text-brand-800">
                    The displayed prices are provided for reference only.
                    The final booking amount is determined by the backend
                    when the booking is created and may reflect the
                    centre's applicable pricing.
                  </p>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    className="btn-primary h-10 rounded-xl px-5 text-sm"
                    onClick={() => setStep(1)}
                  >
                    Choose appointment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div className="p-5 sm:p-6">
                <StepHeader
                  step="Step 2"
                  title="Choose an appointment"
                  description="Select a suitable date and available time slot for your visit. Availability is provided by the diagnostic centre and may change as appointments are booked."
                />

                <div className="mt-5 max-w-xs">
                  <label className="label">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Appointment date
                    </span>

                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        className="field h-10 rounded-xl pl-9 text-sm"
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setSlotId("");
                        }}
                      />
                    </div>
                  </label>
                </div>

                {date && (
                  <div className="mt-6">
                    <div className="mb-3">
                      <h3 className="text-sm font-bold text-gray-900">
                        Available time slots
                      </h3>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Select one available slot to continue.
                      </p>
                    </div>

                    {slots.isLoading ? (
                      <LoadingBlock label="Checking appointment availability..." />
                    ) : slots.data?.data?.length ? (
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {slots.data.data.map((slot) => {
                          const full =
                            slot.booked_count >= slot.capacity;

                          const unavailable =
                            full || !slot.is_active;

                          const isSelected = slotId === slot.id;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={unavailable}
                              onClick={() => setSlotId(slot.id)}
                              className={[
                                "group flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition",
                                isSelected
                                  ? "border-brand-400 bg-brand-50 shadow-sm"
                                  : "border-gray-100 bg-white hover:border-brand-200 hover:bg-brand-50/30",
                                unavailable
                                  ? "cursor-not-allowed opacity-40"
                                  : "",
                              ].join(" ")}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    isSelected
                                      ? "bg-brand-100 text-brand-700"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  <Clock3 size={15} />
                                </span>

                                <div>
                                  <p className="text-sm font-bold text-gray-900">
                                    {slot.start_time.slice(0, 5)} –{" "}
                                    {slot.end_time.slice(0, 5)}
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-gray-500">
                                    {full
                                      ? "Fully booked"
                                      : `${Math.max(
                                          0,
                                          slot.capacity -
                                            slot.booked_count,
                                        )} spaces available`}
                                  </p>
                                </div>
                              </div>

                              {isSelected && (
                                <CheckCircle2
                                  size={17}
                                  className="shrink-0 text-brand-600"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState
                        title="No appointment slots"
                        description="There are no available appointments for this date. Please select another date."
                      />
                    )}
                  </div>
                )}

                <div className="mt-6 flex justify-between gap-2">
                  <button
                    className="btn-secondary h-10 rounded-xl px-4 text-sm"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </button>

                  <button
                    className="btn-primary h-10 rounded-xl px-5 text-sm"
                    disabled={!slotId}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <form
                onSubmit={form.handleSubmit((values) => {
                  setPatient(values);
                  setStep(3);
                })}
                className="p-5 sm:p-6"
              >
                <StepHeader
                  step="Step 3"
                  title="Patient details"
                  description="Enter the patient's information exactly as it should appear on the booking. These details are used to identify the appointment and communicate relevant booking information."
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    ["patient_name", "Patient name", "text"],
                    ["patient_phone", "Phone number", "tel"],
                    ["patient_email", "Email address", "email"],
                    ["patient_dob", "Date of birth", "date"],
                  ].map(([name, label, type]) => (
                    <label className="label" key={name}>
                      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                        {label}
                      </span>

                      <input
                        className="field h-10 rounded-xl text-sm"
                        type={type}
                        {...form.register(name)}
                      />

                      {form.formState.errors[name] && (
                        <small className="mt-1 block text-xs text-red-600">
                          {form.formState.errors[name].message}
                        </small>
                      )}
                    </label>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs leading-5 text-gray-500">
                    Please ensure that the contact information is
                    accurate. Any booking-related communication may be
                    sent using the phone number or email address provided
                    above.
                  </p>
                </div>

                <div className="mt-5 flex justify-between gap-2">
                  <button
                    type="button"
                    className="btn-secondary h-10 rounded-xl px-4 text-sm"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>

                  <button
                    className="btn-primary h-10 rounded-xl px-5 text-sm"
                    type="submit"
                  >
                    Review & continue
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4 */}
            {step === 3 && (
              <div className="p-5 sm:p-6">
                <StepHeader
                  step="Step 4"
                  title="Review your booking"
                  description="Review the appointment information below before creating the booking. Once confirmed, the booking will be submitted to the diagnostic centre and you will proceed to the next stage."
                />

                <div className="mt-5 overflow-hidden rounded-xl border border-gray-100">
                  <ReviewRow
                    label="Diagnostic centre"
                    value={centre.data?.name}
                  />

                  <ReviewRow
                    label="Appointment date"
                    value={date}
                  />

                  <ReviewRow
                    label="Patient"
                    value={patient?.patient_name}
                  />

                  <ReviewRow
                    label="Email"
                    value={patient?.patient_email}
                  />

                  <ReviewRow
                    label="Tests"
                    value={selected
                      .map((item) => item.tests?.name)
                      .filter(Boolean)
                      .join(", ")}
                    last
                  />
                </div>

                <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3">
                  <p className="text-xs leading-5 text-brand-800">
                    No booking total is calculated or trusted by the
                    frontend. The final amount and queue information are
                    determined by the backend and returned as part of
                    the confirmed booking response.
                  </p>
                </div>

                <div className="mt-5 flex justify-between gap-2">
                  <button
                    className="btn-secondary h-10 rounded-xl px-4 text-sm"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>

                  <button
                    className="btn-primary h-10 rounded-xl px-5 text-sm"
                    disabled={create.isPending}
                    onClick={() => submitBooking(patient)}
                  >
                    {create.isPending
                      ? "Creating booking..."
                      : "Create booking"}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Summary */}
          <aside className="h-fit overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-600">
                Booking summary
              </p>

              <h2 className="mt-1 text-sm font-bold text-gray-900">
                {centre.data?.name || "Diagnostic centre"}
              </h2>
            </div>

            <div className="px-4 py-3">
              <div className="space-y-2.5">
                {selected.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="min-w-0 text-gray-600">
                      {item.tests?.name}
                    </span>

                    <span className="shrink-0 font-semibold text-gray-900">
                      ₹
                      {Number(item.price || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3">
              <p className="text-[11px] leading-5 text-gray-500">
                Prices shown are for reference only. The final payable
                amount is authoritative only when it is returned by the
                backend as part of the booking process.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}

/* ----------------------------- */
/* Small reusable UI components  */
/* ----------------------------- */

function StepHeader({ step, title, description }) {
  return (
    <div>
      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
        {step}
      </span>

      <h2 className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
        {title}
      </h2>

      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function ReviewRow({ label, value, last = false }) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 ${
        !last ? "border-b border-gray-100" : ""
      }`}
    >
      <span className="text-xs font-semibold text-gray-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900 sm:max-w-[70%] sm:text-right">
        {value || "—"}
      </span>
    </div>
  );
}
 
