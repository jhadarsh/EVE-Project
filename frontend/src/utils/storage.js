const KEY = "eve_booking_draft";
export const saveBookingDraft = (draft) =>
  sessionStorage.setItem(KEY, JSON.stringify(draft));
export const loadBookingDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
};
export const clearBookingDraft = () => sessionStorage.removeItem(KEY);
