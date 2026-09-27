import { format, parseISO, isValid } from "date-fns";

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount)))
    return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(dateStr, pattern = "dd MMM yyyy") {
  if (!dateStr) return "—";
  try {
    const parsed = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    if (!isValid(parsed)) return dateStr;
    return format(parsed, pattern);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  return formatDate(dateStr, "dd MMM yyyy, hh:mm a");
}

export function formatTime(timeStr) {
  // Backend returns HH:mm:ss (e.g. "09:00:00"). Render as 9:00 AM.
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${period}`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
