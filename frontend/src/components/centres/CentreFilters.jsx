import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

export default function CentreFilters({ search, onSearchChange }) {
  const [value, setValue] = useState(search || '');

  useEffect(() => setValue(search || ''), [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (value !== search) onSearchChange(value);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative max-w-lg">
      <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by centre name or location..."
        className="w-full rounded-full border border-charcoal-200 bg-white py-3 pl-11 pr-10 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
