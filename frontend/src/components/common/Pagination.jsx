export default function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">
        Page {meta.page} of {meta.totalPages}
      </span>
      <div className="flex gap-2">
        <button
          className="btn-secondary"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPage(meta.page - 1)}
        >
          Previous
        </button>
        <button
          className="btn-secondary"
          disabled={!meta.hasNextPage}
          onClick={() => onPage(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
