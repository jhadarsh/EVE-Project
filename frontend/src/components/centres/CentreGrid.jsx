import React from 'react';
import { motion } from 'framer-motion';
import CentreCard from './CentreCard.jsx';
import { CentreGridSkeleton } from '../common/Skeletons.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorState from '../common/ErrorState.jsx';
import Button from '../common/Button.jsx';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CentreGrid({ query, onRetry, page, onPageChange }) {
  if (query.isLoading) return <CentreGridSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={onRetry} />;

  const centres = query.data?.data || [];
  const meta = query.data?.meta;

  if (centres.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No centres found"
        description="Try a different search term or clear your filters to see all diagnostic centres."
      />
    );
  }

  return (
    <div>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {centres.map((centre) => (
          <motion.div key={centre.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <CentreCard centre={centre} />
          </motion.div>
        ))}
      </motion.div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.hasPreviousPage}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={15} /> Previous
          </Button>
          <span className="text-sm text-charcoal-400">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => onPageChange(page + 1)}>
            Next <ChevronRight size={15} />
          </Button>
        </div>
      )}
    </div>
  );
}
