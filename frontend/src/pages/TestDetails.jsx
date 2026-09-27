 
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import Page from "../components/layout/Page";
import { ErrorState, Skeleton } from "../components/common/States";
import { useTest } from "../hooks/useApi";

export default function TestDetails() {
  const { testId } = useParams();
  const q = useTest(testId);

  if (q.isLoading)
    return (
      <Page>
        <style>{`
          @keyframes detailsShimmer {
            0% {
              background-position: -500px 0;
            }
            100% {
              background-position: 500px 0;
            }
          }

          .details-skeleton {
            background: linear-gradient(
              90deg,
              #f3f4f6 25%,
              #fafafa 50%,
              #f3f4f6 75%
            );
            background-size: 1000px 100%;
            animation: detailsShimmer 1.6s infinite linear;
          }
        `}</style>

        <div className="details-skeleton h-72 rounded-3xl" />
      </Page>
    );

  if (q.isError || !q.data)
    return (
      <Page>
        <style>{`
          @keyframes detailsFadeIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .details-error {
            animation: detailsFadeIn 0.5s ease-out both;
          }
        `}</style>

        <div className="details-error">
          <ErrorState
            title="Test not found"
            message={q.error?.normalized?.message}
          />
        </div>
      </Page>
    );

  const t = q.data;

  return (
    <Page>
      <style>{`
        @keyframes detailsFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes detailsScaleIn {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes detailsSlideRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .details-page {
          animation: detailsFadeIn 0.55s ease-out both;
        }

        .details-icon {
          animation: detailsScaleIn 0.5s 0.15s ease-out both;
        }

        .details-content {
          animation: detailsFadeIn 0.6s 0.2s ease-out both;
        }

        .details-info {
          animation: detailsFadeIn 0.6s 0.3s ease-out both;
        }

        .details-back {
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .details-back:hover {
          color: #C2185B;
          transform: translateX(-3px);
        }

        .details-card {
          transition:
            box-shadow 0.35s ease,
            transform 0.35s ease;
        }

        .details-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 20px 50px rgba(194, 24, 91, 0.10),
            0 5px 15px rgba(0, 0, 0, 0.04);
        }

        .details-icon-box {
          transition:
            transform 0.3s ease,
            background-color 0.3s ease;
        }

        .details-card:hover .details-icon-box {
          transform: scale(1.06) rotate(-3deg);
          background-color: #C2185B;
          color: white;
        }

        .details-info-card {
          position: relative;
          overflow: hidden;
        }

        .details-info-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          background: #C2185B;
        }

        .details-arrow {
          transition: transform 0.25s ease;
        }

        .details-back:hover .details-arrow {
          transform: translateX(-3px);
        }

        @media (prefers-reduced-motion: reduce) {
          .details-page,
          .details-icon,
          .details-content,
          .details-info,
          .details-error {
            animation: none;
          }

          .details-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="details-page">
        {/* Back Navigation */}
        <Link
          to="/tests"
          className="details-back inline-flex items-center gap-2 text-sm font-medium text-gray-500"
        >
          <ArrowLeft className="details-arrow" size={16} />
          Back to diagnostic tests
        </Link>

        {/* Main Card */}
        <div className="details-card panel relative mt-6 overflow-hidden p-7 sm:p-10">
          {/* Decorative background */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
            style={{
              backgroundColor: "rgba(194, 24, 91, 0.07)",
            }}
          />

          <div className="relative">
            {/* Category */}
            <div
              className="mb-6 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "#C2185B" }}
            >
              Diagnostic Test
            </div>

            {/* Icon */}
            <div
              className="details-icon details-icon-box grid size-14 place-items-center rounded-2xl"
              style={{
                backgroundColor: "rgba(194, 24, 91, 0.08)",
                color: "#C2185B",
              }}
            >
              <FlaskConical size={27} strokeWidth={1.8} />
            </div>

            {/* Title & Description */}
            <div className="details-content">
              <h1 className="mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {t.name}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
                {t.description ||
                  "A professional diagnostic assessment designed to support accurate evaluation and informed healthcare decisions."}
              </p>
            </div>

            {/* Information */}
            {t.information && (
              <div
                className="details-info details-info-card mt-8 rounded-2xl p-6 sm:p-7"
                style={{
                  backgroundColor: "rgba(194, 24, 91, 0.035)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-[0.16em]"
                      style={{ color: "#C2185B" }}
                    >
                      Test Information
                    </div>

                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      About this diagnostic test
                    </h2>
                  </div>

                  <div
                    className="hidden size-10 items-center justify-center rounded-xl sm:flex"
                    style={{
                      backgroundColor: "rgba(194, 24, 91, 0.08)",
                      color: "#C2185B",
                    }}
                  >
                    <FlaskConical size={18} />
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {t.information}
                </p>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
              <Link
                to="/tests"
                className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#C2185B",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(194, 24, 91, 0.18)",
                }}
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform duration-200 group-hover:-translate-x-1"
                />
                Explore other tests
              </Link>

              <span className="text-sm text-gray-400">
                Review the test information carefully before proceeding.
              </span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

