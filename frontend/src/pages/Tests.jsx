 
import { useState } from "react";
import { Link } from "react-router-dom";
import Page from "../components/layout/Page";
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from "../components/common/States";
import Pagination from "../components/common/Pagination";
import { useTests } from "../hooks/useApi";

export default function Tests() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const q = useTests({
    page,
    limit: 12,
    search,
  });

  const items = q.data?.data || [];

  return (
    <Page>
      {/* Local animations — no global CSS required */}
      <style>{`
        @keyframes testsFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes testsSlideUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes testsCardIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes testsShimmer {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }

        .tests-fade-in {
          animation: testsFadeIn 0.5s ease-out both;
        }

        .tests-slide-up {
          animation: testsSlideUp 0.55s ease-out both;
        }

        .tests-card {
          animation: testsCardIn 0.5s ease-out both;
        }

        .tests-card:hover {
          transform: translateY(-7px);
          box-shadow:
            0 18px 40px rgba(194, 24, 91, 0.12),
            0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .tests-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          background: #C2185B;
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.35s ease;
        }

        .tests-card:hover::before {
          transform: scaleY(1);
          transform-origin: top;
        }

        .tests-icon {
          transition:
            transform 0.3s ease,
            background-color 0.3s ease,
            color 0.3s ease;
        }

        .tests-card:hover .tests-icon {
          transform: scale(1.08) rotate(-3deg);
          background-color: #C2185B;
          color: white;
        }

        .tests-arrow {
          transition: transform 0.3s ease;
        }

        .tests-card:hover .tests-arrow {
          transform: translateX(5px);
        }

        .tests-title {
          transition: color 0.25s ease;
        }

        .tests-card:hover .tests-title {
          color: #C2185B;
        }

        .tests-search {
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .tests-search:focus {
          border-color: #C2185B;
          box-shadow: 0 0 0 4px rgba(194, 24, 91, 0.10);
          transform: translateY(-1px);
        }

        .tests-skeleton {
          background: linear-gradient(
            90deg,
            #f3f4f6 25%,
            #fafafa 50%,
            #f3f4f6 75%
          );
          background-size: 1000px 100%;
          animation: testsShimmer 1.6s infinite linear;
        }

        @media (prefers-reduced-motion: reduce) {
          .tests-fade-in,
          .tests-slide-up,
          .tests-card,
          .tests-skeleton {
            animation: none;
          }

          .tests-card,
          .tests-card:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Header */}
      <div className="tests-fade-in">
        <div
          className="eyebrow"
          style={{ color: "#C2185B" }}
        >
          Diagnostic Catalogue
        </div>

        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              Diagnostic Tests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
              Explore our comprehensive range of diagnostic tests designed to
              support accurate assessment, informed clinical decisions, and
              better patient care.
            </p>
          </div>

          <div
            className="hidden rounded-full border px-4 py-2 text-sm shadow-sm md:block"
            style={{
              borderColor: "rgba(194, 24, 91, 0.15)",
              backgroundColor: "rgba(194, 24, 91, 0.04)",
              color: "#C2185B",
            }}
          >
            {q.data?.meta?.total ?? items.length} tests available
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="tests-slide-up mt-7">
        <div className="relative max-w-2xl">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
            style={{ color: "#C2185B" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            className="field tests-search w-full pl-11 pr-11"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by test name or diagnostic category..."
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {q.isLoading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="tests-skeleton h-11 w-11 rounded-xl" />
              <div className="tests-skeleton mt-5 h-5 w-2/3 rounded" />
              <div className="tests-skeleton mt-4 h-3 w-full rounded" />
              <div className="tests-skeleton mt-2 h-3 w-5/6 rounded" />
              <div className="tests-skeleton mt-2 h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : q.isError ? (
        <div className="tests-fade-in mt-8">
          <ErrorState
            message={q.error?.normalized?.message}
            onRetry={() => q.refetch()}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="tests-fade-in mt-8">
          <EmptyState
            title="No diagnostic tests found"
            description="We couldn't find a test matching your search. Try a different test name or category."
          />
        </div>
      ) : (
        <>
          {/* Test Cards */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t, index) => (
              <Link
                key={t.id}
                to={`/tests/${t.id}`}
                className="tests-card group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300"
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
              >
                {/* Test icon */}
                <div
                  className="tests-icon mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "rgba(194, 24, 91, 0.08)",
                    color: "#C2185B",
                  }}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M9 3h6" />
                    <path d="M10 3v5l-5.5 9.2A2 2 0 0 0 6.2 20h11.6a2 2 0 0 0 1.7-2.8L14 8V3" />
                    <path d="M8 15h8" />
                  </svg>
                </div>

                <h2 className="tests-title text-lg font-bold tracking-tight text-gray-900">
                  {t.name}
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {t.description}
                </p>

                {/* CTA */}
                <div
                  className="mt-5 flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "#C2185B" }}
                >
                  <span>View test details</span>

                  <svg
                    className="tests-arrow h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10">
            <Pagination meta={q.data.meta} onPage={setPage} />
          </div>
        </>
      )}
    </Page>
  );
}

