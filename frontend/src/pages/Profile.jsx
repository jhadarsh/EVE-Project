 
import { useState } from "react";
import { Link } from "react-router-dom";
import Page from "../components/layout/Page";
import Badge from "../components/common/Badge";
import Pagination from "../components/common/Pagination";
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from "../components/common/States";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../hooks/useApi";

export default function Profile() {
  const { profile, user } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const q = useBookings({
    page,
    limit: 10,
    status,
  });

  const items = q.data?.data || [];

  const initials = (profile?.full_name || "User")
    .split(" ")
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Page>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-6 text-white shadow-soft sm:p-8">
          <div className="absolute -right-16 -top-20 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 right-24 size-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
              Patient Portal
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              Manage your personal information and keep track of your
              appointments, booking status, queue details, and payment
              information — all from one secure and convenient place.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Profile Card */}
          <aside className="h-fit space-y-5">
            <div className="panel overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50" />

              <div className="-mt-8 px-6 pb-6">
                <div className="grid size-16 place-items-center rounded-2xl border-4 border-white bg-brand-600 text-xl font-extrabold text-white shadow-md">
                  {initials}
                </div>

                <h2 className="mt-4 text-xl font-extrabold text-gray-900">
                  {profile?.full_name || "Your Profile"}
                </h2>

                <p className="mt-1 break-all text-sm text-gray-500">
                  {user?.email}
                </p>

                {profile?.phone && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm">
                      ☎
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-400">
                        Phone number
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-gray-700">
                        {profile.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Account information
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Your account provides a secure way to manage healthcare
                    bookings and review your appointment history whenever you
                    need it.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust / Information Card */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-5">
              <div className="flex gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
                  ✓
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Your healthcare journey
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Keep your booking information organized and easily
                    accessible. Select any booking to view its complete
                    details.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Booking History */}
          <section className="min-w-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <div className="eyebrow">Appointments</div>

                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                    Booking history
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                    Review your previous and upcoming bookings, check their
                    current status, and access detailed appointment
                    information whenever required.
                  </p>
                </div>

                <div className="w-full sm:w-48">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Filter bookings
                  </label>

                  <select
                    className="field w-full"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Loading */}
              {q.isLoading ? (
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton className="h-36 rounded-2xl" key={i} />
                  ))}
                </div>
              ) : q.isError ? (
                <div className="mt-6">
                  <ErrorState
                    message={q.error?.normalized?.message}
                    onRetry={() => q.refetch()}
                  />
                </div>
              ) : items.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
                  <EmptyState
                    title="No bookings yet"
                    description="Your appointment history will appear here once you create your first booking."
                  />
                </div>
              ) : (
                <>
                  {/* Booking List */}
                  <div className="mt-6 space-y-4">
                    {items.map((b) => (
                      <Link
                        key={b.id}
                        to={`/profile/bookings/${b.id}`}
                        className="group block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 gap-4">
                            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                              <svg
                                className="size-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                              </svg>
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-gray-900">
                                {b.patient_name}
                              </div>

                              <div className="mt-1 text-sm text-gray-500">
                                Booked on{" "}
                                {new Date(b.created_at).toLocaleString(
                                  "en-IN",
                                  {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <Badge status={b.status} />

                            <span className="hidden text-gray-300 transition-transform group-hover:translate-x-1 sm:block">
                              →
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
                          <div className="rounded-xl bg-gray-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Total amount
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-900">
                              ₹
                              {Number(b.total_amount).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gray-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Queue number
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-900">
                              #{b.queue_number ?? "—"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <Pagination meta={q.data.meta} onPage={setPage} />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}

