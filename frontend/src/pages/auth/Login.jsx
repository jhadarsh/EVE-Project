import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import Page from "../../components/layout/Page";
import { loginSchema } from "../../validators/schemas";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { friendlyError } from "../../utils/errors";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { toast } = useToast();
  const next = new URLSearchParams(loc.search).get("next") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) nav(next, { replace: true });
  }, [isAuthenticated]);

  const submit = async (d) => {
    try {
      const data = await login(d);
      if (data.emailConfirmed === false) nav(`/verify-email?email=${encodeURIComponent(d.email)}`);
      else nav(next);
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  return (
    <Page>
      <div className="mx-auto max-w-md">
        <div className="eyebrow flex items-center gap-2">
          <LogIn size={14} /> Welcome back
        </div>
        <h1 className="mt-2 text-3xl font-extrabold">Sign in to EVE</h1>
        <p className="mt-2 text-sm text-gray-500">
          Pick up right where you left off — check upcoming bookings, download reports, and
          reserve your next eye test in a couple of clicks.
        </p>

        <form onSubmit={handleSubmit(submit)} className="panel mt-7 space-y-5 p-6">
          <label className="label">
            Email
            <input className="field" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <small className="text-red-600">{errors.email.message}</small>}
          </label>

          <label className="label">
            Password
            <input className="field" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <small className="text-red-600">{errors.password.message}</small>}
          </label>

          <button disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
            <ShieldCheck size={13} /> Your details are encrypted and never shared.
          </p>

          <p className="text-center text-sm text-gray-500">
            New to EVE?{" "}
            <Link className="font-semibold text-brand-600" to={`/signup?next=${encodeURIComponent(next)}`}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </Page>
  );
}