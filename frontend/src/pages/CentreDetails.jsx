 
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Search } from "lucide-react";

import Page from "../components/layout/Page";
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from "../components/common/States";
import Pagination from "../components/common/Pagination";
import TestCard from "../components/tests/TestCard";
import { useCentre, useCentreTests } from "../hooks/useApi";
import { saveBookingDraft } from "../utils/storage";

export default function CentreDetails() {
  const { centreId } = useParams();
  const nav = useNavigate();

  const centreQuery = useCentre(centreId);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const testsQuery = useCentreTests(centreId, {
    page,
    limit: 12,
    search,
  });

  const items = testsQuery.data?.data || [];

  const selectedItems = useMemo(
    () =>
      items.filter((item) =>
        selected.includes(item.test_id || item.tests?.id),
      ),
    [items, selected],
  );

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const continueBooking = () => {
    saveBookingDraft({
      centreId,
      testIds: selected,
    });

    nav("/booking");
  };

  if (centreQuery.isLoading) {
    return (
      <Page>
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-4 h-48 rounded-2xl" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
            <Skeleton className="h-[420px] rounded-2xl" />
            <Skeleton className="hidden h-64 rounded-2xl lg:block" />
          </div>
        </div>
      </Page>
    );
  }

  if (centreQuery.isError || !centreQuery.data) {
    return (
      <Page>
        <div className="mx-auto max-w-6xl">
          <ErrorState
            title="Centre not found"
            message={
              centreQuery.error?.normalized?.message ||
              "This diagnostic centre could not be loaded."
            }
          />
        </div>
      </Page>
    );
  }

  const centre = centreQuery.data;

  return (
    <Page>
      <div className="mx-auto max-w-6xl pb-24 lg:pb-8">
        {/* Back */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-brand-600"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to centres
        </Link>

        {/* Centre Header */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50/80 via-white to-white shadow-sm">
          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
                Diagnostic Centre
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {centre.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
              <MapPin size={15} className="shrink-0 text-brand-500" />
              <span>{centre.location}</span>
              {centre.address && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{centre.address}</span>
                </>
              )}
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
              {centre.description ||
                "No description provided by the centre."}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Tests */}
          <section className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
                  Available here
                </p>

                <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-gray-900">
                  Choose your tests
                </h2>
              </div>

              {/* Compact Search */}
              <div className="relative sm:w-60">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search tests..."
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {testsQuery.isLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-24 rounded-xl"
                  />
                ))}
              </div>
            ) : testsQuery.isError ? (
              <ErrorState
                message={testsQuery.error?.normalized?.message}
                onRetry={() => testsQuery.refetch()}
              />
            ) : items.length === 0 ? (
              <EmptyState
                title="No available tests"
                description="This centre has no matching active tests."
              />
            ) : (
              <>
                {/* Compact Test List */}
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const id = item.test_id || item.tests?.id;

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-100 bg-white p-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:border-brand-100 hover:shadow-sm"
                      >
                        <TestCard
                          item={item}
                          selected={selected.includes(id)}
                          onToggle={() => toggle(id)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <Pagination
                    meta={testsQuery.data.meta}
                    onPage={setPage}
                  />
                </div>
              </>
            )}
          </section>

          {/* Selection Summary */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Your selection
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Tests selected for booking
                    </p>
                  </div>

                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-50 px-2 text-xs font-bold text-brand-700">
                    {selected.length}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3">
                {selectedItems.length ? (
                  <div className="space-y-2.5">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 text-gray-600">
                          {item.tests?.name ||
                            item.test_name ||
                            "Selected test"}
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
                ) : (
                  <div className="rounded-xl bg-gray-50 px-3 py-4 text-center">
                    <p className="text-xs leading-5 text-gray-500">
                      Select one or more tests to continue with your
                      booking.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 bg-gray-50/50 p-3">
                <button
                  disabled={!selected.length}
                  className="btn-primary flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={continueBooking}
                >
                  <CalendarDays size={16} />
                  Continue to booking
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Booking Bar */}
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200/80 bg-white/95 px-3 py-2.5 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {selected.length} test
                {selected.length > 1 ? "s" : ""} selected
              </p>

              <p className="truncate text-[11px] text-gray-500">
                Final amount is calculated by the backend.
              </p>
            </div>

            <button
              className="btn-primary flex h-9 shrink-0 items-center gap-2 rounded-lg px-4 text-sm"
              onClick={continueBooking}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </Page>
  );
}


 