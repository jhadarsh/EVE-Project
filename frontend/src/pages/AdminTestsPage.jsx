import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Search } from 'lucide-react';
import { useTests, useCreateTest, useUpdateTest } from '../hooks/useTests';
import { useToast } from '../context/ToastContext.jsx';
import AdminTable from '../components/admin/AdminTable.jsx';
import TestFormModal from '../components/admin/TestFormModal.jsx';
import Button from '../components/common/Button.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { ApiError } from '../services/apiClient';

export default function AdminTestsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const params = useMemo(() => ({ page, limit: 10, ...(search ? { search } : {}) }), [page, search]);
  const query = useTests(params);
  const createTest = useCreateTest();
  const updateTest = useUpdateTest();

  const handleSubmit = (values, onDone) => {
    const action = editing
      ? updateTest.mutateAsync({ testId: editing.id, payload: values })
      : createTest.mutateAsync(values);

    action
      .then(() => {
        toast.success(editing ? 'Test updated' : 'Test created');
        onDone();
        setEditing(null);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Something went wrong.');
      });
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (row) => <span className="line-clamp-1 max-w-xs">{row.description || '—'}</span> },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => <StatusBadge status={row.is_active ? 'CONFIRMED' : 'CANCELLED'} />,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-charcoal-800">Diagnostic tests</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add test
        </Button>
      </div>

      <div className="relative mb-5 max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search tests..."
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
        emptyLabel="No diagnostic tests yet"
        renderActions={(row) => (
          <button
            onClick={() => {
              setEditing(row);
              setModalOpen(true);
            }}
            className="rounded-full p-2 text-charcoal-400 hover:bg-charcoal-100 hover:text-charcoal-700"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil size={15} />
          </button>
        )}
      />

      <TestFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        submitting={createTest.isPending || updateTest.isPending}
      />
    </div>
  );
}
