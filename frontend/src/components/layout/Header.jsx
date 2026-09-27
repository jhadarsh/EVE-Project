import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Menu, UserCircle, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
export default function Header() {
  const { isAuthenticated, isAdmin, profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const doLogout = async () => {
    await logout();
    nav("/");
  };
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
            <HeartPulse size={20} />
          </span>
          <span>EVE</span>
          <span className="hidden text-sm font-medium text-gray-400 sm:inline">
            Healthcare
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link to="/" className="hover:text-brand-600">
            Discover
          </Link>
          <Link to="/tests" className="hover:text-brand-600">
            Tests
          </Link>
          {isAuthenticated && (
            <Link to="/profile" className="hover:text-brand-600">
              My bookings
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="hover:text-brand-600">
              Admin
            </Link>
          )}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <span className="mr-2 max-w-32 truncate text-sm text-gray-500">
                {profile?.full_name}
              </span>
              <button className="btn-secondary" onClick={doLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn-secondary" to="/login">
                Sign in
              </Link>
              <Link className="btn-primary" to="/signup">
                Create account
              </Link>
            </>
          )}
        </div>
        <button
          className="rounded-xl p-2 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-black/5 bg-white p-4 md:hidden">
          <div className="container-page flex flex-col gap-2">
            <Link onClick={() => setOpen(false)} to="/">
              Discover
            </Link>
            <Link onClick={() => setOpen(false)} to="/tests">
              Tests
            </Link>
            {isAuthenticated ? (
              <>
                <Link onClick={() => setOpen(false)} to="/profile">
                  Profile & bookings
                </Link>
                {isAdmin && (
                  <Link onClick={() => setOpen(false)} to="/admin">
                    Admin
                  </Link>
                )}
                <button
                  className="mt-2 text-left font-semibold text-brand-600"
                  onClick={doLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mt-2 font-semibold">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
