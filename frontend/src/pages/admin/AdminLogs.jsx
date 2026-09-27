import { useState } from "react";
import { useAdminLogs } from "../../hooks/useApi";
import Pagination from "../../components/common/Pagination";
import { ErrorState, Skeleton } from "../../components/common/States";
export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const q = useAdminLogs({ page, limit: 20, search });
  return (
    <>
      <div className="mb-5">
        <input
          className="field max-w-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search logs"
        />
      </div>
      {q.isLoading ? (
        <Skeleton className="h-96" />
      ) : q.isError ? (
        <ErrorState
          message={q.error?.normalized?.message}
          onRetry={() => q.refetch()}
        />
      ) : (
        <div className="panel overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Event</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Message</th>
                <th className="p-4">User</th>
              </tr>
            </thead>
            <tbody>
              {(q.data?.data || []).map((l) => (
                <tr className="border-b last:border-0" key={l.id}>
                  <td className="p-4 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">{l.event_type}</td>
                  <td className="p-4">{l.severity}</td>
                  <td className="p-4">{l.message}</td>
                  <td className="p-4">{l.user_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={q.data?.meta} onPage={setPage} />
    </>
  );
}
