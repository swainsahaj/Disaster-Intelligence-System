import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  LogOut,
  RefreshCw,
  Send,
  Clock,
  MapPin,
  Phone,
  ChevronDown,
  Loader2,
  HeartHandshake,
  ShieldCheck,
  Inbox,
  CheckCircle2,
  AlertCircle,
  MessagesSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type HelpRequest = {
  id: number;
  requestType: string;
  description: string;
  region: string;
  phone: string;
  status: string;
  createdAt: string;
};

type Alert = {
  id: number;
  title: string;
  message: string;
  region: string;
  severity: string;
  createdAt: string;
};

type Disaster = {
  id: number;
  name: string;
  type: string;
  severity: string;
  region: string;
  year: number;
};

type RequestForm = {
  requestType: string;
  description: string;
  region: string;
  phone: string;
};

const REQUEST_TYPES = ["Medical assistance", "Food and water", "Shelter", "Rescue support", "Other"];

const initialForm: RequestForm = {
  requestType: "Medical assistance",
  description: "",
  region: "",
  phone: "",
};

const STATUS_META: Record<string, { label: string; text: string; bg: string; border: string }> = {
  pending: { label: "We've got it", text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" },
  in_progress: { label: "Help is on the way", text: "text-sky-800", bg: "bg-sky-50", border: "border-sky-200" },
  resolved: { label: "Resolved", text: "text-[#4d6b43]", bg: "bg-[#eef3ea]", border: "border-[#cfe0c6]" },
  rejected: { label: "Closed", text: "text-stone-500", bg: "bg-stone-100", border: "border-stone-200" },
};

const SEVERITY_META: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  critical: { text: "text-[#9a3b2b]", bg: "bg-[#fbeae5]", border: "border-[#f0c9bd]", dot: "bg-[#c1502f]" },
  high: { text: "text-[#a05a26]", bg: "bg-[#fbeee1]", border: "border-[#f0d6b8]", dot: "bg-[#c9822f]" },
  moderate: { text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  low: { text: "text-sky-800", bg: "bg-sky-50", border: "border-sky-200", dot: "bg-sky-500" },
};

function severityMeta(severity: string) {
  return SEVERITY_META[severity?.toLowerCase()] ?? SEVERITY_META.low;
}

function statusMeta(status: string) {
  return (
    STATUS_META[status] ?? { label: status, text: "text-stone-600", bg: "bg-stone-100", border: "border-stone-200" }
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function relativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function firstNameFromEmail(value: string | null) {
  if (!value) return "there";
  const handle = value.split("@")[0]?.replace(/[._\d]+/g, " ").trim() ?? "";
  const first = handle.split(" ")[0];
  if (!first) return "there";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function initialsFromEmail(value: string | null) {
  const name = firstNameFromEmail(value);
  return name === "there" ? "•" : name.slice(0, 2).toUpperCase();
}

function EmptyState({ icon: Icon, title, note }: { icon: typeof Inbox; title: string; note: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100">
        <Icon className="h-5 w-5 text-stone-400" />
      </div>
      <p className="mt-3 text-sm font-medium text-stone-700">{title}</p>
      <p className="mt-1 max-w-[220px] text-sm text-stone-500">{note}</p>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [form, setForm] = useState<RequestForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const userEmail = useMemo(() => {
    try {
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
      return raw ? (JSON.parse(raw).email as string) : null;
    } catch {
      return null;
    }
  }, []);

  const loadDashboard = async (isRefresh = false) => {
    setError("");
    if (isRefresh) setRefreshing(true);
    try {
      const [requestResponse, alertResponse, disasterResponse] = await Promise.all([
        apiFetch<{ data: HelpRequest[] }>("/my-help-requests"),
        apiFetch<{ data: Alert[] }>("/alerts"),
        apiFetch<{ data: Disaster[] }>("/disasters"),
      ]);
      setRequests(requestResponse.data);
      setAlerts(alertResponse.data);
      setDisasters(disasterResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load your dashboard just now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!justSubmitted) return;
    const timer = setTimeout(() => setJustSubmitted(false), 5000);
    return () => clearTimeout(timer);
  }, [justSubmitted]);

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await apiFetch<{ data: HelpRequest }>("/help-requests", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(initialForm);
      setJustSubmitted(true);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send that — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const openRequests = requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const name = firstNameFromEmail(userEmail);

  const inputBase =
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#c1652f] focus:ring-1 focus:ring-[#c1652f]/30";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c1652f]/10">
            <HeartHandshake className="h-5 w-5 animate-pulse text-[#c1652f]" />
          </div>
          <p className="text-sm text-stone-500">Getting things ready for you...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-stone-800">
      {/* Header */}
      <header className="border-b border-stone-200/80 bg-[#fbf9f5]">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c1652f] text-sm font-semibold text-white">
                {initialsFromEmail(userEmail)}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Community Response Desk
                </p>
                <h1 className="font-serif text-2xl text-stone-900">
                  {greeting()}, {name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/vulnerability-zones")}
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
              >
                Vulnerability zones
              </button>
              <button
                type="button"
                onClick={() => void loadDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-6 text-stone-500">
            {openRequests > 0
              ? `You have ${openRequests} request${openRequests === 1 ? "" : "s"} being looked after right now. We'll update you the moment there's news.`
              : "Whenever you need us — whether it's urgent or you're just checking in — we're right here."}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Request form */}
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm shadow-stone-900/[0.03]">
            {justSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3ea]">
                  <CheckCircle2 className="h-7 w-7 text-[#4d6b43]" />
                </div>
                <h3 className="mt-4 font-serif text-xl text-stone-900">Your request is in.</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
                  Someone from our response team will reach out as soon as possible. You can track progress in your
                  request history to the right.
                </p>
                <button
                  type="button"
                  onClick={() => setJustSubmitted(false)}
                  className="mt-5 text-sm font-medium text-[#c1652f] hover:text-[#a5502a]"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#c1652f]/10">
                    <MessagesSquare className="h-4.5 w-4.5 text-[#c1652f]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-stone-900">Tell us what's going on</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Take a breath — share what you need and where you are, and we'll take it from there.
                    </p>
                  </div>
                </div>

                <form onSubmit={submitRequest} className="space-y-5">
                  <div>
                    <label htmlFor="requestType" className="mb-1.5 block text-sm font-medium text-stone-700">
                      What kind of help do you need?
                    </label>
                    <div className="relative">
                      <select
                        id="requestType"
                        value={form.requestType}
                        onChange={(event) => setForm({ ...form, requestType: event.target.value })}
                        className={`${inputBase} appearance-none pr-9`}
                      >
                        {REQUEST_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-stone-700">
                      What's happening?
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      maxLength={500}
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      placeholder="Share as much as feels useful — how many people are with you, what you're seeing, anything that helps us respond well."
                      className={`${inputBase} resize-none`}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="region" className="mb-1.5 block text-sm font-medium text-stone-700">
                        Where are you?
                      </label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                          id="region"
                          required
                          value={form.region}
                          onChange={(event) => setForm({ ...form, region: event.target.value })}
                          placeholder="Riverside District"
                          className={`${inputBase} pl-9`}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-stone-700">
                        Best number to reach you
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                          id="phone"
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(event) => setForm({ ...form, phone: event.target.value })}
                          placeholder="+91 00000 00000"
                          className={`${inputBase} pl-9`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-full bg-[#c1652f] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a5502a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {submitting ? "Sending..." : "Send request"}
                    </button>
                    <p className="flex items-center gap-1.5 text-xs text-stone-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Only shared with verified responders
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Request history */}
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm shadow-stone-900/[0.03]">
            <h2 className="font-serif text-xl text-stone-900">Your requests</h2>
            <p className="mt-1 text-sm text-stone-500">Every request you've sent us, and where things stand.</p>

            <div className="mt-5 space-y-3">
              {requests.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  title="Nothing here yet"
                  note="When you send a request, you'll be able to follow it here."
                />
              )}
              {requests.map((request) => {
                const meta = statusMeta(request.status);
                return (
                  <div key={request.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-stone-800">{request.requestType}</p>
                      <span
                        className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.bg} ${meta.text} ${meta.border}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-stone-500">{request.description}</p>
                    <div className="mt-2.5 flex items-center gap-3 text-xs text-stone-400">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {request.region}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts + incidents */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm shadow-stone-900/[0.03]">
            <h2 className="font-serif text-xl text-stone-900">What's happening nearby</h2>
            <p className="mt-1 text-sm text-stone-500">Active alerts from the response team.</p>

            <div className="mt-5 space-y-3">
              {alerts.length === 0 && (
                <EmptyState
                  icon={CheckCircle2}
                  title="All quiet right now"
                  note="No active alerts in your area at the moment."
                />
              )}
              {alerts.slice(0, 5).map((alert) => {
                const meta = severityMeta(alert.severity);
                return (
                  <div key={alert.id} className={`rounded-xl border p-4 ${meta.bg} ${meta.border}`}>
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${meta.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-800">{alert.title}</p>
                        <p className="mt-1 text-sm leading-6 text-stone-600">{alert.message}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {alert.region}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {relativeTime(alert.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm shadow-stone-900/[0.03]">
            <h2 className="font-serif text-xl text-stone-900">Recent incidents</h2>
            <p className="mt-1 text-sm text-stone-500">A record of what's come through recently.</p>

            <div className="mt-5 divide-y divide-stone-100">
              {disasters.length === 0 && (
                <EmptyState icon={Inbox} title="No records yet" note="Incidents will appear here as they're logged." />
              )}
              {disasters.slice(0, 5).map((disaster) => (
                <div key={disaster.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-800">{disaster.name}</p>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {disaster.type} &middot; {disaster.region}
                    </p>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
                    {disaster.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}