import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import Page from "../../components/layout/Page";
import { verifySchema } from "../../validators/schemas";
import { authApi } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { friendlyError } from "../../utils/errors";

const RESEND_COOLDOWN = 45;

export default function VerifyEmail() {
  const loc = useLocation();
  const nav = useNavigate();
  const { toast } = useToast();
  const { verify, isAuthenticated, loading: authLoading } = useAuth();

  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const next = params.get("next") || "/";
  const urlEmail = params.get("email") || "";
  const urlToken = params.get("token") || "";
  const urlType = params.get("type") || "signup";

  // Two different confirmation styles can land here:
  // 1. A ?token=...&email=...&type=... query string -> we call /auth/verify.
  // 2. A #access_token=... hash fragment (Supabase's magic-link redirect)
  //    -> AuthContext already picks the token up and logs the user in on
  //    mount, so we just watch isAuthenticated instead of calling anything.
  //
  // IMPORTANT: AuthContext strips the hash from the URL once it reads it
  // (window.history.replaceState). If we recomputed this on every render,
  // it would silently flip to false the moment that happens - right before
  // the "did auth finish?" effect below needs to check it. Capture it ONCE
  // on mount instead, so it can't change out from under us.
  const hasHashTokenRef = useRef(typeof window !== "undefined" && window.location.hash.includes("access_token"));
  const hasHashToken = hasHashTokenRef.current;

  // "pending"   – waiting for the user to open the email and click the link
  // "verifying" – auto-verifying a token/hash found in the URL
  // "success"   – verified, redirecting into the app
  // "manual"    – auto-verify failed (or there was nothing to auto-verify);
  //               let the user paste a code in by hand
  const [status, setStatus] = useState(urlToken || hasHashToken ? "verifying" : "pending");
  const [email, setEmail] = useState(urlEmail);
  const [manualOpen, setManualOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const ranAutoVerify = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: urlEmail, token: urlToken, type: urlType },
  });

  useEffect(() => { setValue("email", email); }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const goSuccess = () => {
    setStatus("success");
    toast("Email verified — you're all set.", "success");
    setTimeout(() => nav(next, { replace: true }), 900);
  };

  const runVerify = async (payload) => {
    try {
      await verify(payload);
      goSuccess();
    } catch (e) {
      setStatus("manual");
      setManualOpen(true);
      toast(friendlyError(e), "error");
    }
  };

  // Query-string token (?token=...): call /auth/verify right away.
  useEffect(() => {
    if (urlToken && !ranAutoVerify.current) {
      ranAutoVerify.current = true;
      runVerify({ email: urlEmail, token: urlToken, type: urlType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hash-fragment token (#access_token=...): AuthContext already consumed
  // it and is hydrating the session, so just wait for that to resolve.
  useEffect(() => {
    if (!hasHashToken || authLoading) return;
    if (isAuthenticated) goSuccess();
    else { setStatus("manual"); setManualOpen(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHashToken, authLoading, isAuthenticated]);

  const submit = (d) => runVerify(d);

  const resend = async () => {
    if (!email) { toast("Enter your email first.", "error"); return; }
    try {
      await authApi.resendVerification({ email });
      toast("Verification email sent — check your inbox.", "success");
      setCooldown(RESEND_COOLDOWN);
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  return (
    <Page>
      <div className="mx-auto max-w-md">
        <div className="eyebrow">Email verification</div>
        <h1 className="mt-2 text-3xl font-extrabold">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-500">
          One quick step before you can book a test with EVE — we just need to confirm this
          address is really yours.
        </p>

        <div className="panel mt-7 space-y-6 p-6">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Loader2 className="animate-spin text-brand-600" size={30} />
              <p className="font-semibold">Verifying your email…</p>
              <p className="text-sm text-gray-500">This only takes a second, hang tight.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="text-green-600" size={34} />
              <p className="font-semibold">You're verified!</p>
              <p className="text-sm text-gray-500">Taking you into your account now…</p>
            </div>
          )}

          {status === "pending" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <MailCheck className="text-brand-600" size={34} />
              <p className="font-semibold">Check your inbox</p>
              <p className="text-sm text-gray-500">
                We've sent a verification link to{" "}
                {email ? <span className="font-medium text-gray-700">{email}</span> : "your email address"}.
                Open it on this device and it'll confirm your account and sign you straight
                in — you don't need to come back to this page.
              </p>
              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck size={13} /> Links expire after a while, so it's best to verify soon after it lands.
              </p>
            </div>
          )}

          {status === "manual" && (
            <p className="text-center text-sm text-gray-500">
              That link didn't check out — it may have expired. If you have a verification
              code instead, you can enter it below, or request a new email.
            </p>
          )}

          {(status === "pending" || status === "manual") && !manualOpen && (
            <button type="button" className="btn-secondary w-full" onClick={() => setManualOpen(true)}>
              Enter code manually instead
            </button>
          )}

          {manualOpen && status !== "success" && status !== "verifying" && (
            <form onSubmit={handleSubmit(submit)} className="space-y-5 border-t border-gray-100 pt-5">
              <label className="label">
                Email
                <input
                  className="field"
                  type="email"
                  {...register("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <small className="text-red-600">{errors.email.message}</small>}
              </label>
              <label className="label">
                Verification code
                <input className="field" inputMode="numeric" placeholder="123456" {...register("token")} />
                {errors.token && <small className="text-red-600">{errors.token.message}</small>}
              </label>
              <button disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Verifying..." : "Verify email"}
              </button>
            </form>
          )}

          {status !== "success" && (
            <button
              type="button"
              className="w-full text-center text-sm font-semibold text-brand-600 disabled:cursor-not-allowed disabled:text-gray-400"
              onClick={resend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend verification email"}
            </button>
          )}

          <Link className="block text-center text-sm text-gray-400" to="/login">
            Back to sign in
          </Link>
        </div>
      </div>
    </Page>
  );
}