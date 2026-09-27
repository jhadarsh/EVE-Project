import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../common/Button.jsx';
import { ListSkeleton } from '../common/Skeletons.jsx';
import ErrorState from '../common/ErrorState.jsx';
import EmptyState from '../common/EmptyState.jsx';

export default function AdminTable({ columns, rows, isLoading, isError, error, onRetry, meta, page, onPageChange, emptyLabel, renderActions }) {
  if (isLoading) return <ListSkeleton count={5} />;
  if (isError) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyLabel || 'No records found'} />;

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-charcoal-100 text-charcoal-400">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              {renderActions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-charcoal-50 last:border-0 hover:bg-charcoal-50/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-charcoal-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {renderActions && <td className="px-4 py-3 text-right">{renderActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={!meta.hasPreviousPage} onClick={() => onPageChange(page - 1)}>
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
