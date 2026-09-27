import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-charcoal-200 bg-white/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-50 text-charcoal-400">
        <Icon size={22} />
      </div>
      <h3 className="text-base font-semibold text-charcoal-700">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-charcoal-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
