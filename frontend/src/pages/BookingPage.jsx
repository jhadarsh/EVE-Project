import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingSelection } from '../context/BookingContext.jsx';
import { useCreateBooking } from '../hooks/useBookings';
import { useToast } from '../context/ToastContext.jsx';
import BookingStepper from '../components/booking/BookingStepper.jsx';
import DateSlotPicker from '../components/booking/DateSlotPicker.jsx';
import PatientForm from '../components/booking/PatientForm.jsx';
import BookingSummaryCard from '../components/booking/BookingSummaryCard.jsx';
import Button from '../components/common/Button.jsx';
import { ApiError } from '../services/apiClient';
import { formatDate, formatTime } from '../utils/formatters';

export default function BookingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { centre, selectedTests, slot, patient, setSlot, setPatient, clear } = useBookingSelection();
  const createBooking = useCreateBooking();

  const [step, setStep] = useState(1); // 1 = appointment, 2 = patient, 3 = confirmation
  const [submitError, setSubmitError] = useState(null);

  if (!centre || selectedTests.length === 0) {
    return <Navigate to="/" replace />;
  }

  const totalEstimate = selectedTests.reduce((sum, t) => sum + Number(t.price || 0), 0);

  const handleConfirm = async () => {
    setSubmitError(null);
    try {
      const res = await createBooking.mutateAsync({
        centre_id: centre.id,
        slot_id: slot.id,
        patient_name: patient.patient_name,
        patient_dob: patient.patient_dob || undefined,
        patient_phone: patient.patient_phone,
        patient_email: patient.patient_email,
        test_ids: selectedTests.map((t) => t.test_id),
      });
      const booking = res.data;
      toast.success('Booking created — continue to payment');
      clear();
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not create the booking. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-xl font-bold text-charcoal-800 sm:text-2xl">Complete your booking</h1>
      <div className="mt-6 mb-8">
        <BookingStepper currentStep={step + 1} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-charcoal-100 bg-white p-6 shadow-soft">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="slot" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h2 className="mb-4 text-lg font-semibold text-charcoal-800">Choose date & time</h2>
                <DateSlotPicker centreId={centre.id} selectedSlot={slot} onSelectSlot={setSlot} />
                <Button className="mt-6" disabled={!slot} onClick={() => setStep(2)}>
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="patient" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h2 className="mb-4 text-lg font-semibold text-charcoal-800">Patient information</h2>
                <PatientForm
                  defaultValues={patient}
                  onSubmit={(values) => {
                    setPatient(values);
                    setStep(3);
                  }}
                />
                <button onClick={() => setStep(1)} className="mt-4 text-sm font-medium text-charcoal-400 hover:text-charcoal-700">
                  &larr; Back to appointment
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h2 className="mb-4 text-lg font-semibold text-charcoal-800">Review & confirm</h2>
                <div className="space-y-3 text-sm text-charcoal-600">
                  <p>
                    <span className="font-medium text-charcoal-800">{formatDate(slot?.appointment_date)}</span>
                    {' · '}
                    {formatTime(slot?.start_time)} &ndash; {formatTime(slot?.end_time)}
                  </p>
                  <p>Patient: {patient?.patient_name}</p>
                  <p>Contact: {patient?.patient_phone} &middot; {patient?.patient_email}</p>
                </div>
                {submitError && <p className="mt-4 text-sm font-medium text-danger-500">{submitError}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={createBooking.isPending}>
                    Back
                  </Button>
                  <Button onClick={handleConfirm} loading={createBooking.isPending}>
                    Confirm booking
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <BookingSummaryCard
            centre={centre}
            slot={slot}
            patient={step >= 3 ? patient : null}
            tests={selectedTests}
            totalAmount={totalEstimate}
          />
        </div>
      </div>
    </div>
  );
}
