import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Sparkles } from "lucide-react";
import Page from "../../components/layout/Page";
import { signupSchema } from "../../validators/schemas";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { friendlyError } from "../../utils/errors";

const FIELDS = [
  ["full_name", "Full name", "text"],
  ["phone", "Phone", "tel"],
  ["email", "Email", "email"],
  ["password", "Password", "password"],
];

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { toast } = useToast();
  const next = new URLSearchParams(loc.search).get("next") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const submit = async (d) => {
    try {
      const data = await signup(d);
      if (data.emailConfirmed === false) {
        nav(`/verify-email?email=${encodeURIComponent(d.email)}&next=${encodeURIComponent(next)}`);
      } else {
        nav(next);
      }
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  return (
    <Page>
      <div className="mx-auto max-w-md">
        <div className="eyebrow flex items-center gap-2">
          <Sparkles size={14} /> Create your account
        </div>
        <h1 className="mt-2 text-3xl font-extrabold">Join EVE</h1>
        <p className="mt-2 text-sm text-gray-500">
          Create a free account to book eye tests at centres near you, track your results, and
          manage every appointment in one place. It takes less than a minute.
        </p>

        <form onSubmit={handleSubmit(submit)} className="panel mt-7 space-y-4 p-6">
          {FIELDS.map(([name, label, type]) => (
            <label className="label" key={name}>
              {label}
              <input className="field" type={type} {...register(name)} />
              {errors[name] && <small className="text-red-600">{errors[name].message}</small>}
            </label>
          ))}

          <button disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Creating..." : "Create account"}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
            <ShieldCheck size={13} /> We'll send a verification link right after this.
          </p>

          <p className="text-center text-sm text-gray-500">
            Already registered?{" "}
            <Link className="font-semibold text-brand-600" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </Page>
  );
}