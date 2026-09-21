import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "../lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthMode = "login" | "signup";

type AuthForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
  agreeToTerms: boolean;
};

type FieldErrors = Partial<Record<keyof AuthForm, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length === 0) return { score: 0, label: "", color: "" };
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-amber-500" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof AuthForm, boolean>>>({});
  const [form, setForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    agreeToTerms: false,
  });

  // Focus the first field on mount, and again whenever mode switches
  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  // Clear cross-field state (confirm password, terms) when switching modes
  useEffect(() => {
    setError("");
    setTouched({});
  }, [mode]);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const errors: FieldErrors = useMemo(() => {
    const next: FieldErrors = {};

    if (mode === "signup" && touched.name && form.name.trim().length < 2) {
      next.name = "Enter your full name.";
    }

    if (touched.email) {
      if (!form.email) next.email = "Email is required.";
      else if (!EMAIL_REGEX.test(form.email)) next.email = "Enter a valid email address.";
    }

    if (touched.password) {
      if (!form.password) next.password = "Password is required.";
      else if (mode === "signup" && form.password.length < 8)
        next.password = "Use at least 8 characters.";
    }

    if (mode === "signup" && touched.confirmPassword) {
      if (form.confirmPassword !== form.password) {
        next.confirmPassword = "Passwords don't match.";
      }
    }

    if (mode === "signup" && touched.agreeToTerms && !form.agreeToTerms) {
      next.agreeToTerms = "You must accept the terms to continue.";
    }

    return next;
  }, [form, touched, mode]);

  const isFormValid = useMemo(() => {
    if (!form.email || !EMAIL_REGEX.test(form.email)) return false;
    if (!form.password) return false;

    if (mode === "signup") {
      if (form.name.trim().length < 2) return false;
      if (form.password.length < 8) return false;
      if (form.confirmPassword !== form.password) return false;
      if (!form.agreeToTerms) return false;
    }

    return true;
  }, [form, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mark every relevant field as touched so validation messages surface
    setTouched({
      name: mode === "signup",
      email: true,
      password: true,
      confirmPassword: mode === "signup",
      agreeToTerms: mode === "signup",
    });

    if (!isFormValid) {
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name.trim(), email: form.email, password: form.password };

      const data = await apiFetch<{
        success: boolean;
        token: string;
        user: User;
      }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      const storage = form.rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      navigate(data.user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (hasError: boolean) =>
    `w-full rounded-none border-0 border-b bg-transparent py-3 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-slate-300 focus:border-teal-700"
    }`;

  return (
    <div className="min-h-screen bg-[#f3f5f4] text-slate-900">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        {/* Left panel */}
        <div className="auth-panel-left relative flex min-h-screen items-center justify-center overflow-hidden border-r border-[#263b46] bg-[#10242d] p-8 text-white sm:p-10 lg:p-16">
          <div className="auth-grid-lines pointer-events-none absolute inset-0 opacity-40" />
          <div className="auth-corner-light pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="auth-corner-light auth-corner-light-delay pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="w-full max-w-xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-300" />
              </span>
              Emergency Operations — Live
            </div>

            <h1 className="mt-8 max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#f4f7f5] sm:text-5xl lg:text-[4rem]">
              Disaster Intelligence System
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#b8c8c8] sm:text-lg">
              Monitor incidents, identify vulnerable regions, coordinate emergency response,
              and support affected communities with a single operational view.
            </p>

            <div className="mt-12 flex flex-wrap border-y border-[#36515a] py-5">
              <div className="min-w-[33%] flex-1 border-r border-[#36515a] pr-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#9db4b6]">Incidents</div>
                <div className="mt-2 text-2xl font-semibold text-[#f4f7f5]">24</div>
              </div>
              <div className="min-w-[33%] flex-1 border-r border-[#36515a] px-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#9db4b6]">Alerts</div>
                <div className="mt-2 text-2xl font-semibold text-[#f4f7f5]">08</div>
              </div>
              <div className="min-w-[33%] flex-1 pl-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#9db4b6]">Risk</div>
                <div className="mt-2 flex items-center gap-1.5 text-xl font-semibold text-[#f0b36b]">
                  <ShieldAlert className="h-4 w-4" />
                  High
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-panel-right relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f5f4] px-8 py-12 sm:px-16 lg:px-20">
          <div className="auth-light-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="auth-right-light pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="w-full max-w-lg">
            <div className="mb-10 flex gap-2 border-b border-slate-300 pb-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`px-5 py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-[#d5ece8] text-[#123b43] shadow-[inset_0_-2px_0_#1b7775]"
                    : "bg-[#edf1ef] text-slate-500 hover:bg-[#e4ebe8] hover:text-slate-800"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`px-5 py-2.5 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-[#f5e5cf] text-[#68421d] shadow-[inset_0_-2px_0_#c47d36]"
                    : "bg-[#edf1ef] text-slate-500 hover:bg-[#e4ebe8] hover:text-slate-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5c7475]">Access portal</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#17343b] sm:text-4xl">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-sm text-[#687b7d]">
                {mode === "login"
                  ? "Sign in to access the operations dashboard."
                  : "Set up access to report and respond to incidents."}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#334d50]">
                    Full name
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789091]" />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="name"
                      className={inputClasses(!!errors.name)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="mt-1.5 text-xs text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#334d50]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789091]" />
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className={inputClasses(!!errors.email)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-[#334d50]">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs font-medium text-[#1b7775] hover:text-[#145958]"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789091]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className={`${inputClasses(!!errors.password)} pr-10`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[#789091] hover:text-[#17343b]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {mode === "signup" && form.password && (
                  <div className="mt-2">
                    <div className="flex h-1 gap-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-all ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#789091]">
                      Password strength: <span className="text-[#334d50]">{strength.label}</span>
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#334d50]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789091]" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputClasses(!!errors.confirmPassword)} pr-10`}
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-[#789091] hover:text-[#17343b]"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {form.confirmPassword && form.confirmPassword === form.password && (
                      <CheckCircle2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirm-password-error" className="mt-1.5 text-xs text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {mode === "login" ? (
                <label className="flex items-center gap-2 text-sm text-[#52686a]">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-[#a8b9b8] bg-white text-[#1b7775] focus:ring-[#1b7775] focus:ring-offset-[#f3f5f4]"
                  />
                  Keep me signed in on this device
                </label>
              ) : (
                <div>
                  <label className="flex items-start gap-2 text-sm text-[#52686a]">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={form.agreeToTerms}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="mt-0.5 h-4 w-4 rounded border-[#a8b9b8] bg-white text-[#1b7775] focus:ring-[#1b7775] focus:ring-offset-[#f3f5f4]"
                    />
                    <span>
                      I agree to the{" "}
                      <a href="/terms" className="text-[#1b7775] hover:text-[#145958]">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-[#1b7775] hover:text-[#145958]">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1b7775] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#145958] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Login"
                  : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#687b7d]">
              {mode === "login" ? "Need access to the platform?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="font-semibold text-[#1b7775] hover:text-[#145958]"
              >
                {mode === "login" ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}