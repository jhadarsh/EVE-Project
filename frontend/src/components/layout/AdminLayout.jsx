import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, FlaskConical, FileClock, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/centres', label: 'Diagnostic centres', icon: Building2 },
  { to: '/admin/tests', label: 'Diagnostic tests', icon: FlaskConical },
  { to: '/admin/logs', label: 'System logs', icon: FileClock },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-warmwhite">
      <div className="container-page flex flex-col gap-6 py-8 lg:flex-row">
        <aside className="lg:w-64 shrink-0">
          <NavLink to="/" className="mb-6 flex items-center gap-2 text-sm font-medium text-charcoal-500 hover:text-charcoal-800">
            <ArrowLeft size={15} /> Back to site
          </NavLink>
          <h1 className="mb-4 text-xl font-bold text-charcoal-800">Admin</h1>
          <nav className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-charcoal-800 text-white' : 'text-charcoal-600 hover:bg-charcoal-100'
                  )
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
