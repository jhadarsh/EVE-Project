import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAdminLogs } from '../hooks/useAdminLogs';
import AdminTable from '../components/admin/AdminTable.jsx';
import { formatDateTime } from '../utils/formatters';

export default function AdminLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({ page, limit: 15, ...(search ? { search } : {}) }), [page, search]);
  const query = useAdminLogs(params);

  const columns = [
    { key: 'event_type', label: 'Event' },
    { key: 'message', label: 'Message', render: (row) => <span className="line-clamp-1 max-w-md">{row.message}</span> },
    { key: 'severity', label: 'Severity' },
    { key: 'created_at', label: 'Time', render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-charcoal-800">System logs</h1>

      <div className="relative mb-5 max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search logs..."
          className="w-full rounded-full border border-charcoal-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <AdminTable
        columns={columns}
        rows={query.data?.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        meta={query.data?.meta}
        page={page}
        onPageChange={setPage}
        emptyLabel="No logs found"
      />
    </div>
  );
}
