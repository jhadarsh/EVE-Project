export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "FAILED", "CANCELLED"];
export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED"];
export const statusTone = (status) =>
  ({
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-green-50 text-green-700 border-green-200",
    SUCCESS: "bg-green-50 text-green-700 border-green-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  })[status] || "bg-gray-100 text-gray-600 border-gray-200";
