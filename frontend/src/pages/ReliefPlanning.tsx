import { useState } from "react";
import { ArrowLeft, Calculator, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Plan = {
  affectedPeople: number;
  severity: string;
  durationDays: number;
  adjustedPeople: number;
  plan: {
    shelters: number;
    foodPackets: number;
    waterLiters: number;
    medicalKits: number;
    rescueTeams: number;
    volunteers: number;
  };
};

export default function ReliefPlanning() {
  const navigate = useNavigate();
  const [affectedPeople, setAffectedPeople] = useState("100");
  const [severity, setSeverity] = useState("High");
  const [durationDays, setDurationDays] = useState("3");
  const [result, setResult] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculatePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ data: Plan }>("/relief-plan", {
        method: "POST",
        body: JSON.stringify({ affectedPeople: Number(affectedPeople), severity, durationDays: Number(durationDays) }),
      });
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate relief plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5 lg:px-10">
          <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button>
          <div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Response operations</p><h1 className="text-2xl font-bold">Relief planning</h1></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
        {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={calculatePlan} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Calculator className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Planning inputs</p><h2 className="text-lg font-bold">Scenario details</h2></div></div>
            <div className="mt-6 space-y-5"><label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Affected people</span><input required min="1" type="number" value={affectedPeople} onChange={(event) => setAffectedPeople(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-500" /></label><label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Severity</span><select value={severity} onChange={(event) => setSeverity(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-500"><option>Low</option><option>Medium</option><option>High</option><option>Extreme</option></select></label><label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration in days</span><input required min="1" type="number" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-500" /></label><button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? "Calculating..." : "Calculate relief plan"}</button></div>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><ClipboardList className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Resource estimate</p><h2 className="text-lg font-bold">Recommended allocation</h2></div></div>{result ? <><div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1">Base: {result.affectedPeople.toLocaleString()} people</span><span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Adjusted: {result.adjustedPeople.toLocaleString()}</span><span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">{result.severity} · {result.durationDays} days</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Resource label="Shelters" value={result.plan.shelters} unit="locations" /><Resource label="Food packets" value={result.plan.foodPackets} unit="packets" /><Resource label="Water" value={result.plan.waterLiters} unit="liters" /><Resource label="Medical kits" value={result.plan.medicalKits} unit="kits" /><Resource label="Rescue teams" value={result.plan.rescueTeams} unit="teams" /><Resource label="Volunteers" value={result.plan.volunteers} unit="people" /></div></> : <div className="flex min-h-64 items-center justify-center text-center text-sm text-slate-500">Enter a scenario to estimate the resources required for response.</div>}</div>
        </section>
      </div>
    </main>
  );
}

function Resource({ label, value, unit }: { label: string; value: number; unit: string }) { return <div className="border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">{unit}</p></div>; }
