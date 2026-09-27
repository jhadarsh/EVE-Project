import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/authApi";
import { getAccessToken } from "../services/apiClient";

const AuthContext = createContext(null);

// Supabase's magic-link / signup-confirmation redirect delivers the session
// as a URL hash fragment on whatever page it lands on, e.g.:
//   /#access_token=...&refresh_token=...&expires_at=...&type=signup
// It is NOT a query param and does NOT hit a specific route, so this has to
// run once at the top of the app, independent of which page the link opens.
function consumeHashSession() {
  const hash = window.location.hash;
  if (!hash || !hash.includes("access_token")) return false;

  const params = new URLSearchParams(hash.slice(1)); // drop the leading '#'
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken) return false;

  localStorage.setItem("eve_access_token", accessToken);
  if (refreshToken) localStorage.setItem("eve_refresh_token", refreshToken);

  // Strip the hash so the token doesn't linger in the address bar/history.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  return true;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    if (!getAccessToken()) { setLoading(false); return; }
    try {
      const res = await authApi.me();
      setSession(res.data.data.user ? { user: res.data.data.user } : null);
      setProfile(res.data.data.profile || null);
    } catch {
      localStorage.removeItem("eve_access_token");
      setSession(null); setProfile(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    // If we just arrived from a Supabase redirect, grab the token BEFORE
    // hydrate() checks localStorage, so the very first load already knows
    // the user is authenticated.
    consumeHashSession();
    hydrate();
  }, []);

  // Shared helper: persist an access token and update session/profile state.
  // login, signup, and verify all funnel through this so that ANY flow that
  // returns a session logs the user in immediately.
  const applySession = (data) => {
    if (data?.session?.access_token) localStorage.setItem("eve_access_token", data.session.access_token);
    if (data?.session) setSession(data.session);
    if (data?.profile) setProfile(data.profile);
  };

  const login = async (body) => {
    const res = await authApi.login(body);
    const data = res.data.data;
    applySession(data);
    return data;
  };

  const signup = async (body) => {
    const res = await authApi.signup(body);
    const data = res.data.data;
    applySession(data);
    return data;
  };

  // Used by the verify-email page for the manual/OTP-code fallback path.
  const verify = async (body) => {
    const res = await authApi.verify(body);
    const data = res.data.data;
    applySession(data);
    if (!data?.session?.access_token && getAccessToken()) await hydrate();
    return data;
  };

  const logout = async () => {
    try { if (getAccessToken()) await authApi.logout(); } finally {
      localStorage.removeItem("eve_access_token");
      localStorage.removeItem("eve_refresh_token");
      setSession(null); setProfile(null);
    }
  };

  const value = useMemo(() => ({
    session, user: session?.user || null, profile, loading, isAuthenticated: !!getAccessToken(),
    isAdmin: profile?.role === "ADMIN", login, signup, verify, logout, refresh: hydrate
  }), [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);