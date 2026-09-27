import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCentres } from '../hooks/useCentres';
import CentreGrid from '../components/centres/CentreGrid.jsx';
import CentreFilters from '../components/centres/CentreFilters.jsx';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [page, setPage] = useState(1);

  const params = useMemo(() => {
    const p = { page, limit: 9 };
    if (search) p.search = search;
    return p;
  }, [page, search]);

  const query = useCentres(params);

  const handleSearchChange = (value) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  };

  return (
    <div>
      <section className="border-b border-charcoal-100 bg-gradient-to-b from-brand-50/60 to-warmwhite">
        <div className="container-page py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl font-bold leading-tight text-charcoal-800 sm:text-4xl lg:text-5xl">
              Diagnostic tests, booked in minutes
            </h1>
            <p className="mt-4 text-lg text-charcoal-500">
              Compare centres, pick your tests and choose a slot that works for you &mdash; all in one place.
            </p>
            <div className="mt-8">
              <CentreFilters search={search} onSearchChange={handleSearchChange} />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-charcoal-800">
            {search ? `Results for "${search}"` : 'Diagnostic centres near you'}
          </h2>
        </div>
        <CentreGrid query={query} onRetry={query.refetch} page={page} onPageChange={setPage} />
      </section>
    </div>
  );
}
