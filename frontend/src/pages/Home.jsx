import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, Sparkles } from "lucide-react";
import Page from "../components/layout/Page";
import CentreCard from "../components/centres/CentreCard";
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from "../components/common/States";
import Pagination from "../components/common/Pagination";
import { useCentres } from "../hooks/useApi";

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const gridItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [page, setPage] = useState(1);

  const q = useCentres({
    page,
    limit: 9,
    search: submitted,
  });

  const data = q.data;
  const centres = data?.data || [];

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSubmitted(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setSubmitted("");
    setPage(1);
  };

  return (
    <Page>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#21181d] px-6 py-11 text-white sm:px-10 lg:px-14 lg:py-14">
        {/* Pulse-line accent, drawn once on load */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-brand-300/25 sm:h-24"
          viewBox="0 0 800 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 55 H200 L225 25 L250 82 L275 12 L300 68 L325 55 H800"
            stroke="currentColor"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
          />
        </svg>

        <motion.div
          className="relative max-w-3xl"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={heroItem} className="eyebrow text-brand-200">
            EVE Healthcare
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="mt-3 text-[28px] font-bold leading-[1.15] tracking-tight sm:text-[34px]"
          >
            Diagnostics, with less friction.
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mt-4 max-w-xl text-[13.5px] leading-6 text-white/65 sm:text-sm"
          >
            Discover active diagnostic centres, choose the tests you need, and
            reserve an appointment in a clear, guided flow.
          </motion.p>

          <motion.form
            variants={heroItem}
            className="mt-7 flex flex-col gap-2 rounded-xl bg-white p-1.5 sm:flex-row"
            onSubmit={handleSearch}
          >
            <div className="flex flex-1 items-center gap-2 px-3 text-gray-400">
              <Search size={17} />

              <input
                className="w-full py-2.5 text-[13.5px] text-gray-900 outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by centre or location"
                aria-label="Search diagnostic centres"
              />
            </div>

            <button type="submit" className="btn-primary px-5 text-[13px]">
              Search centres
            </button>
          </motion.form>
        </motion.div>
      </section>

      {/* Features */}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="panel p-[18px]">
          <ShieldCheck className="text-brand-600" size={20} />

          <h3 className="mt-3 text-[13.5px] font-semibold text-gray-900">
            Backend-verified
          </h3>

          <p className="mt-1 text-[13px] leading-5 text-gray-500">
            Availability, prices and booking status come straight from the
            API.
          </p>
        </div>

        <div className="panel p-[18px]">
          <Sparkles className="text-brand-600" size={20} />

          <h3 className="mt-3 text-[13.5px] font-semibold text-gray-900">
            Guided booking
          </h3>

          <p className="mt-1 text-[13px] leading-5 text-gray-500">
            Select multiple tests and complete appointment details step by
            step.
          </p>
        </div>

        <div className="panel p-[18px]">
          <h3 className="text-2xl font-bold text-brand-600">24/7</h3>

          <p className="mt-2 text-[13px] leading-5 text-gray-500">
            Browse centre, test and slot information whenever your backend is
            available.
          </p>
        </div>
      </div>

      {/* Centres */}
      <section className="mt-11">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="eyebrow">Discover</div>

            <h2 className="mt-1.5 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              Diagnostic centres
            </h2>
          </div>

          {submitted && (
            <button
              type="button"
              className="text-[13px] font-semibold text-brand-600"
              onClick={handleClearSearch}
            >
              Clear search
            </button>
          )}
        </div>

        {q.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : q.isError ? (
          <ErrorState
            message={q.error?.normalized?.message || "Unable to load centres."}
            onRetry={() => q.refetch()}
          />
        ) : centres.length === 0 ? (
          <EmptyState
            title="No centres found"
            description="Try a different search term or browse again without a filter."
          />
        ) : (
          <>
            <motion.div
              key={`${submitted}-${page}`}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={gridContainer}
              initial="hidden"
              animate="show"
            >
              {centres.map((centre) => (
                <motion.div key={centre.id} variants={gridItem}>
                  <CentreCard centre={centre} />
                </motion.div>
              ))}
            </motion.div>

            {data?.meta && (
              <Pagination meta={data.meta} onPage={setPage} />
            )}
          </>
        )}
      </section>
    </Page>
  );
}