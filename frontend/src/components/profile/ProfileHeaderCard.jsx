import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { initials } from '../../utils/formatters';

export default function ProfileHeaderCard({ profile, email }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-charcoal-100 bg-white p-5 shadow-soft">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
        {initials(profile?.full_name) || '?'}
      </span>
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-charcoal-800">{profile?.full_name || 'Your profile'}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-400">
          {email && (
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {email}
            </span>
          )}
          {profile?.phone && (
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> {profile.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
