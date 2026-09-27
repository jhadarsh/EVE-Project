import { useState } from "react";
import {
  useCentres,
  useTests,
  useCentreTests,
} from "../../hooks/useApi";
import { centresApi } from "../../services/centresApi";
import { useToast } from "../../context/ToastContext";
import { friendlyError } from "../../utils/errors";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import { ErrorState, Skeleton } from "../../components/common/States";
export default function AdminCentres() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testsOpen, setTestsOpen] = useState(false);
const [selectedCentre, setSelectedCentre] = useState(null);

const [selectedTestId, setSelectedTestId] = useState("");
const [testPrice, setTestPrice] = useState("");
const [mappingSaving, setMappingSaving] = useState(false);
  const q = useCentres({ page, limit: 10, search });
  const testsQuery = useTests({
  page: 1,
  limit: 100,
});

const centreTestsQuery = useCentreTests(
  selectedCentre?.id,
  {
    page: 1,
    limit: 100,
  }
);
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    description: "",
    is_active: true,
  });
  const start = (c = null) => {
    setEditing(c);
    setForm(
      c
        ? {
            name: c.name,
            location: c.location,
            address: c.address,
            description: c.description || "",
            is_active: c.is_active,
          }
        : {
            name: "",
            location: "",
            address: "",
            description: "",
            is_active: true,
          },
    );
    setOpen(true);
  };

  const openTests = (centre) => {
  setSelectedCentre(centre);
  setSelectedTestId("");
  setTestPrice("");
  setTestsOpen(true);
};
  const save = async () => {
    setSaving(true);
    try {
      editing
        ? await centresApi.update(editing.id, form)
        : await centresApi.create(form);
      toast(editing ? "Centre updated." : "Centre created.", "success");
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
          placeholder="Search centres"
        />
        <button className="btn-primary" onClick={() => start()}>
          Add centre
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {(q.data?.data || []).map((c) => (
                <tr className="border-b last:border-0" key={c.id}>
                  <td className="p-4 font-semibold">{c.name}</td>
                  <td className="p-4">{c.location}</td>
                  <td className="p-4">{c.address}</td>
                  <td className="p-4">{c.is_active ? "Active" : "Inactive"}</td>
<td className="p-4">
  <div className="flex items-center gap-3">
    <button
      className="font-semibold text-brand-600"
      onClick={() => start(c)}
    >
      Edit
    </button>

    <button
      className="font-semibold text-gray-700"
      onClick={() => openTests(c)}
    >
      Tests
    </button>
  </div>
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
        title={editing ? "Edit centre" : "Create centre"}
      >
        <div className="space-y-4">
          {[
            ["name", "Name"],
            ["location", "Location"],
            ["address", "Address"],
            ["description", "Description"],
          ].map(([k, l]) => (
            <label className="label" key={k}>
              {l}
              <textarea
                className="field"
                rows={k === "description" ? 4 : 1}
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
            {saving ? "Saving..." : "Save centre"}
          </button>
        </div>
      </Modal>
      <Modal
  open={testsOpen}
  onClose={() => setTestsOpen(false)}
  title={`${selectedCentre?.name || "Centre"} — Tests`}
>
  <div className="space-y-6">

    {/* Add test */}
    <div className="rounded-2xl border bg-gray-50 p-4">
      <h3 className="font-semibold">
        Add test to this centre
      </h3>

      <div className="mt-4 space-y-4">

        <label className="label">
          Test

          <select
            className="field"
            value={selectedTestId}
            onChange={(e) =>
              setSelectedTestId(e.target.value)
            }
          >
            <option value="">
              Select a test
            </option>

            {(testsQuery.data?.data || []).map((test) => (
              <option
                key={test.id}
                value={test.id}
                disabled={!test.is_active}
              >
                {test.name}
                {!test.is_active ? " (Inactive)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="label">
          Price

          <input
            className="field"
            type="number"
            min="0"
            value={testPrice}
            onChange={(e) =>
              setTestPrice(e.target.value)
            }
            placeholder="Enter price"
          />
        </label>

        <button
          className="btn-primary w-full"
          disabled={
            mappingSaving ||
            !selectedTestId ||
            testPrice === ""
          }
          onClick={async () => {
            setMappingSaving(true);

            try {
              await centresApi.addTest(
                selectedCentre.id,
                {
                  test_id: selectedTestId,
                  price: Number(testPrice),
                  is_available: true,
                }
              );

              toast(
                "Test added to centre.",
                "success"
              );

              setSelectedTestId("");
              setTestPrice("");

              centreTestsQuery.refetch();
            } catch (e) {
              toast(
                friendlyError(e),
                "error"
              );
            } finally {
              setMappingSaving(false);
            }
          }}
        >
          {mappingSaving
            ? "Adding..."
            : "Add test"}
        </button>
      </div>
    </div>

    {/* Existing tests */}
    <div>
      <h3 className="mb-3 font-semibold">
        Tests available at this centre
      </h3>

      {centreTestsQuery.isLoading ? (
        <Skeleton className="h-40" />
      ) : centreTestsQuery.isError ? (
        <ErrorState
          message={
            centreTestsQuery.error?.normalized?.message
          }
          onRetry={() =>
            centreTestsQuery.refetch()
          }
        />
      ) : (centreTestsQuery.data?.data || []).length === 0 ? (
        <div className="rounded-xl border p-5 text-sm text-gray-500">
          No tests have been assigned to this centre.
        </div>
      ) : (
        <div className="space-y-3">
          {(centreTestsQuery.data?.data || []).map(
            (item) => (
              <div
                key={item.id}
                className="rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {item.tests?.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.tests?.description || "No description"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₹
                      {Number(item.price || 0).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                      {item.is_available
                        ? "Available"
                        : "Unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>

  </div>
</Modal>
    </>
  );
}
