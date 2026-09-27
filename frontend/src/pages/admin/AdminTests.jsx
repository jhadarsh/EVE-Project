import { useState } from "react";
import { useTests } from "../../hooks/useApi";
import { testsApi } from "../../services/testsApi";
import { useToast } from "../../context/ToastContext";
import { friendlyError } from "../../utils/errors";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import { ErrorState, Skeleton } from "../../components/common/States";
export default function AdminTests() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const q = useTests({ page, limit: 10, search });
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    description: "",
    information: "",
    is_active: true,
  });
  const start = (t = null) => {
    setEditing(t);
    setForm(
      t
        ? {
            name: t.name,
            description: t.description || "",
            information: t.information || "",
            is_active: t.is_active,
          }
        : { name: "", description: "", information: "", is_active: true },
    );
    setOpen(true);
  };
  const save = async () => {
    setSaving(true);
    try {
      editing
        ? await testsApi.update(editing.id, form)
        : await testsApi.create(form);
      toast(editing ? "Test updated." : "Test created.", "success");
      setOpen(false);
      q.refetch();
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="field sm:max-w-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search tests"
        />
        <button className="btn-primary" onClick={() => start()}>
          Add test
        </button>
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
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {(q.data?.data || []).map((t) => (
                <tr className="border-b last:border-0" key={t.id}>
                  <td className="p-4 font-semibold">{t.name}</td>
                  <td className="max-w-md p-4">{t.description || "—"}</td>
                  <td className="p-4">{t.is_active ? "Active" : "Inactive"}</td>
                  <td className="p-4">
                    <button
                      className="font-semibold text-brand-600"
                      onClick={() => start(t)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={q.data?.meta} onPage={setPage} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit test" : "Create test"}
      >
        <div className="space-y-4">
          {[
            ["name", "Name"],
            ["description", "Description"],
            ["information", "Information"],
          ].map(([k, l]) => (
            <label className="label" key={k}>
              {l}
              <textarea
                className="field"
                rows={k === "name" ? 1 : 5}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </label>
          ))}
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Active
            </label>
          )}
          <button
            className="btn-primary w-full"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving..." : "Save test"}
          </button>
        </div>
      </Modal>
    </>
  );
}
