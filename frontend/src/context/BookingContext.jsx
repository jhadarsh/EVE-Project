import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SESSION_STORAGE_KEYS } from '../constants';

const BookingContext = createContext(null);

const EMPTY_SELECTION = {
  centre: null, // { id, name, location, address }
  selectedTests: [], // [{ id (centre_test id), test_id, name, price }]
  slot: null, // { id, appointment_date, start_time, end_time }
  patient: null, // { patient_name, patient_dob, patient_phone, patient_email }
  redirectAfterAuth: null, // path to return to once login/verification completes
};

function readInitial() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEYS.pendingBooking);
    return raw ? { ...EMPTY_SELECTION, ...JSON.parse(raw) } : EMPTY_SELECTION;
  } catch {
    return EMPTY_SELECTION;
  }
}

export function BookingProvider({ children }) {
  const [selection, setSelection] = useState(readInitial);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.pendingBooking, JSON.stringify(selection));
  }, [selection]);

  const setCentre = useCallback((centre) => {
    setSelection((prev) => ({ ...prev, centre, selectedTests: [], slot: null }));
  }, []);

  const toggleTest = useCallback((test) => {
    setSelection((prev) => {
      const exists = prev.selectedTests.some((t) => t.id === test.id);
      return {
        ...prev,
        selectedTests: exists
          ? prev.selectedTests.filter((t) => t.id !== test.id)
          : [...prev.selectedTests, test],
      };
    });
  }, []);

  const removeTest = useCallback((testId) => {
    setSelection((prev) => ({
      ...prev,
      selectedTests: prev.selectedTests.filter((t) => t.id !== testId),
    }));
  }, []);

  const setSlot = useCallback((slot) => {
    setSelection((prev) => ({ ...prev, slot }));
  }, []);

  const setPatient = useCallback((patient) => {
    setSelection((prev) => ({ ...prev, patient }));
  }, []);

  const setRedirectAfterAuth = useCallback((path) => {
    setSelection((prev) => ({ ...prev, redirectAfterAuth: path }));
  }, []);

  const clear = useCallback(() => {
    setSelection(EMPTY_SELECTION);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.pendingBooking);
  }, []);

  const totalEstimate = useMemo(
    () => selection.selectedTests.reduce((sum, t) => sum + Number(t.price || 0), 0),
    [selection.selectedTests]
  );

  const value = useMemo(
    () => ({
      ...selection,
      totalEstimate,
      setCentre,
      toggleTest,
      removeTest,
      setSlot,
      setPatient,
      setRedirectAfterAuth,
      clear,
    }),
    [selection, totalEstimate, setCentre, toggleTest, removeTest, setSlot, setPatient, setRedirectAfterAuth, clear]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingSelection() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookingSelection must be used within a BookingProvider');
  return ctx;
}
