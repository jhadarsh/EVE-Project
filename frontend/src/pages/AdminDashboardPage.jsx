import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, FlaskConical, FileClock } from 'lucide-react';
import { useCentres } from '../hooks/useCentres';
import { useTests } from '../hooks/useTests';
import { useAdminLogs } from '../hooks/useAdminLogs';

function StatCard({ icon: Icon, label, value, to, loading }) {
  return (
    <Link to={to} className="rounded-2xl border border-charcoal-100 bg-white p-5 shadow-soft transition hover:shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={19} />
      </div>
      <p className="mt-4 text-2xl font-bold text-charcoal-800">{loading ? '—' : value}</p>
      <p className="text-sm text-charcoal-400">{label}</p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const centresQuery = useCentres({ page: 1, limit: 1 });
  const testsQuery = useTests({ page: 1, limit: 1 });
  const logsQuery = useAdminLogs({ page: 1, limit: 1 });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-charcoal-800">Overview</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Building2}
          label="Diagnostic centres"
          value={centresQuery.data?.meta?.total}
          to="/admin/centres"
          loading={centresQuery.isLoading}
        />
        <StatCard
          icon={FlaskConical}
          label="Diagnostic tests"
          value={testsQuery.data?.meta?.total}
          to="/admin/tests"
          loading={testsQuery.isLoading}
        />
        <StatCard
          icon={FileClock}
          label="System log entries"
          value={logsQuery.data?.meta?.total}
          to="/admin/logs"
          loading={logsQuery.isLoading}
        />
      </div>
    </div>
  );
}
