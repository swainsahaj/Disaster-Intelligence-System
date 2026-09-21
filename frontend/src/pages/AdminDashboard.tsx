import { useEffect, useState } from "react";
import { LogOut, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Summary = {
	totalDisasters: number;
	highSeverity: number;
	byType: Record<string, number>;
	recentDisasters: Array<{
		id: number;
		name: string;
		type: string;
		region: string;
		severity: string;
		year: number;
	}>;
};

type Disaster = {
	id: number;
	name: string;
	type: string;
	severity: string;
	region: string;
	year: number;
};

type HelpRequest = {
	id: number;
	requestType: string;
	region: string;
	status: string;
	description: string;
};

type Alert = {
	id: number;
	title: string;
	message: string;
	region: string;
	severity: string;
	createdAt: string;
};

type VulnerabilityZone = {
	region: string;
	totalDisasters: number;
	severeDisasters: number;
	riskScore: number;
	riskLevel: string;
};

type DisasterForm = Omit<Disaster, "id">;
type AlertForm = Omit<Alert, "id" | "createdAt">;

export default function AdminDashboard() {
	const navigate = useNavigate();
	const [summary, setSummary] = useState<Summary | null>(null);
	const [disasters, setDisasters] = useState<Disaster[]>([]);
	const [requests, setRequests] = useState<HelpRequest[]>([]);
	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [zones, setZones] = useState<VulnerabilityZone[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [saving, setSaving] = useState(false);
	const [alertFormOpen, setAlertFormOpen] = useState(false);
	const [savingAlert, setSavingAlert] = useState(false);
	const [alertForm, setAlertForm] = useState<AlertForm>({
		title: "",
		message: "",
		region: "",
		severity: "High",
	});
	const adminUser = (() => {
		const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
		try {
			return raw ? JSON.parse(raw) as { name?: string; email?: string; role?: string } : null;
		} catch {
			return null;
		}
	})();
	const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);
	const [form, setForm] = useState<DisasterForm>({
		name: "",
		type: "Flood",
		severity: "Medium",
		region: "",
		year: new Date().getFullYear(),
	});

	const loadDashboard = async () => {
		setLoading(true);
		setError("");

		try {
			const [summaryResponse, disastersResponse, requestsResponse, alertsResponse, zonesResponse] = await Promise.all([
				apiFetch<{ data: Summary }>("/dashboard/summary"),
				apiFetch<{ data: Disaster[] }>("/disasters"),
				apiFetch<{ data: HelpRequest[] }>("/help-requests"),
				apiFetch<{ data: Alert[] }>("/alerts"),
				apiFetch<{ data: VulnerabilityZone[] }>("/vulnerability-zones"),
			]);

			setSummary(summaryResponse.data);
			setDisasters(disastersResponse.data);
			setRequests(requestsResponse.data);
			setAlerts(alertsResponse.data);
			setZones(zonesResponse.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
		} finally {
			setLoading(false);
		}
	};

	const openCreateForm = () => {
		setEditingId(null);
		setForm({ name: "", type: "Flood", severity: "Medium", region: "", year: new Date().getFullYear() });
		setFormOpen(true);
	};

	const openEditForm = (disaster: Disaster) => {
		setEditingId(disaster.id);
		setForm({ name: disaster.name, type: disaster.type, severity: disaster.severity, region: disaster.region, year: disaster.year });
		setFormOpen(true);
	};

	const saveDisaster = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaving(true);
		setError("");

		try {
			const endpoint = editingId ? `/disasters/${editingId}` : "/disasters";
			const response = await apiFetch<{ data: Disaster }>(endpoint, {
				method: editingId ? "PUT" : "POST",
				body: JSON.stringify(form),
			});

			setDisasters((current) => editingId
				? current.map((disaster) => disaster.id === editingId ? response.data : disaster)
				: [response.data, ...current]);
			setFormOpen(false);
			await loadDashboard();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to save disaster.");
		} finally {
			setSaving(false);
		}
	};

	const deleteDisaster = async (id: number) => {
		if (!window.confirm("Delete this disaster record?")) return;

		try {
			await apiFetch(`/disasters/${id}`, { method: "DELETE" });
			setDisasters((current) => current.filter((disaster) => disaster.id !== id));
			await loadDashboard();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to delete disaster.");
		}
	};

	const updateRequestStatus = async (id: number, status: string) => {
		setUpdatingRequestId(id);
		setError("");

		try {
			await apiFetch<{ data: HelpRequest }>(`/help-requests/${id}/status`, {
				method: "PATCH",
				body: JSON.stringify({ status }),
			});
			await loadDashboard();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to update request status.");
		} finally {
			setUpdatingRequestId(null);
		}
	};

	const createAlert = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSavingAlert(true);
		setError("");

		try {
			await apiFetch<{ data: Alert }>("/alerts", {
				method: "POST",
				body: JSON.stringify(alertForm),
			});
			setAlertFormOpen(false);
			setAlertForm({ title: "", message: "", region: "", severity: "High" });
			await loadDashboard();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to create alert.");
		} finally {
			setSavingAlert(false);
		}
	};

	const deactivateAlert = async (id: number) => {
		if (!window.confirm("Deactivate this alert?")) return;

		try {
			await apiFetch(`/alerts/${id}/deactivate`, { method: "PATCH" });
			await loadDashboard();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to deactivate alert.");
		}
	};

	useEffect(() => {
		void loadDashboard();
	}, []);

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
		navigate("/", { replace: true });
	};

	if (loading) {
		return <main className="flex min-h-screen items-center justify-center bg-[#f3f5f4] text-[#315456]">Loading dashboard...</main>;
	}

	return (
		<main className="min-h-screen bg-[#f3f5f4] text-[#18383d]">
			<header className="border-b border-[#d8e2df] bg-[#f8faf9]">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1b7775]">Disaster Intelligence System</p>
						<h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Operations overview</h1>
					</div>
					<div className="flex items-center gap-3">
						<button type="button" onClick={() => void loadDashboard()} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[#426466] hover:bg-[#e6efec]">
							<RefreshCw className="h-4 w-4" /> Refresh
						</button>
						<button type="button" onClick={logout} className="inline-flex items-center gap-2 border-l border-[#d8e2df] px-3 py-2 text-sm text-[#426466]">
							<LogOut className="h-4 w-4" /> Sign out
						</button>
						<div className="hidden border-l border-[#d8e2df] pl-3 text-right sm:block">
							<p className="text-sm font-semibold text-[#18383d]">{adminUser?.name || "Admin"}</p>
							<p className="text-[11px] text-[#789091]">{adminUser?.email || "admin account"} · {adminUser?.role || "admin"}</p>
						</div>
					</div>
				</div>
			</header>

			<div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-10">
				{error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

				<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Metric label="Total incidents" value={summary?.totalDisasters ?? 0} />
					<Metric label="High severity" value={summary?.highSeverity ?? 0} />
					<Metric label="Help requests" value={requests.filter((request) => request.status === "pending").length} />
					<Metric label="Active alerts" value={alerts.length} />
				</section>

				<section className="border-t border-[#d8e2df] pt-6">
					<div className="flex items-end justify-between gap-4">
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d8585]">Risk intelligence</p>
							<h2 className="mt-1 text-xl font-semibold">Vulnerability zones</h2>
							<p className="mt-1 text-sm text-[#6d8585]">Regional risk calculated from incident frequency and severity.</p>
						</div>
						<div className="flex items-center gap-4"><button type="button" onClick={() => navigate("/vulnerability-zones")} className="text-sm font-semibold text-[#1b7775] hover:text-[#145958]">View full register</button><button type="button" onClick={() => navigate("/relief-planning")} className="bg-[#1b7775] px-3 py-2 text-xs font-semibold text-white hover:bg-[#145958]">Relief planning</button></div>
					</div>
					<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{zones.slice(0, 4).map((zone) => (
							<div key={zone.region} className="border border-[#d8e2df] bg-white p-4">
								<div className="flex items-start justify-between gap-3"><p className="font-semibold text-[#284b4e]">{zone.region}</p><span className={`text-xs font-semibold ${zone.riskLevel === "High" ? "text-red-700" : zone.riskLevel === "Medium" ? "text-amber-700" : "text-emerald-700"}`}>{zone.riskLevel}</span></div>
								<p className="mt-3 text-2xl font-semibold text-[#18383d]">{zone.riskScore}</p>
								<p className="mt-1 text-xs text-[#789091]">risk score · {zone.severeDisasters} severe incidents</p>
							</div>
						))}
						{zones.length === 0 && <p className="text-sm text-[#6d8585]">No vulnerability data is available yet.</p>}
					</div>
				</section>

				<section className="overflow-hidden">
					<div className="px-0 py-5">
						<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#176764]">Priority response queue</p>
						<div className="flex items-end justify-between gap-4">
						<div>
							<h2 className="mt-1 text-2xl font-semibold">Emergency help requests</h2>
							<p className="mt-1 text-sm text-[#527575]">Review and coordinate assistance before routine administration.</p>
						</div>
						<span className="text-3xl font-semibold text-[#1b7775]">{requests.filter((request) => request.status === "pending").length}</span>
						</div>
					</div>
					<div className="overflow-x-auto px-0 pb-4 pt-2">
						<table className="w-full min-w-[600px] text-left text-sm">
							<thead className="border-b border-[#d8e2df] text-[10px] uppercase tracking-[0.16em] text-[#6d8585]">
								<tr><th className="pb-3">Request</th><th className="pb-3">Region</th><th className="pb-3">Status</th><th className="pb-3">Description</th></tr>
							</thead>
							<tbody className="divide-y divide-[#e0e8e5]">
								{requests.map((request) => (
									<tr key={request.id}>
										<td className="py-4">{request.requestType}</td>
										<td className="py-4 text-[#52686a]">{request.region}</td>
										<td className="py-4"><select disabled={updatingRequestId === request.id} aria-label={`Edit status for request ${request.id}`} value={request.status} onChange={(event) => void updateRequestStatus(request.id, event.target.value)} className="border border-[#a9cbc2] bg-[#f7fbfa] px-2 py-1.5 text-xs font-semibold text-[#176764] outline-none focus:border-[#1b7775] disabled:cursor-wait disabled:opacity-60"><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></td>
										<td className="max-w-sm truncate py-4 text-[#6d8585]">{request.description}</td>
									</tr>
								))}
							</tbody>
						</table>
						{requests.length === 0 && <p className="py-6 text-sm text-[#6d8585]">No emergency requests submitted.</p>}
					</div>
				</section>

				<section className="grid gap-10 lg:grid-cols-2">
					<div className="p-0">
						<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d8585]">Incident profile</p>
						<h2 className="mt-1 text-xl font-semibold">Events by type</h2>
						<div className="mt-5 space-y-3">
							{Object.entries(summary?.byType || {}).map(([type, count]) => (
								<div key={type} className="flex items-center justify-between border-b border-[#e0e8e5] py-3 text-sm">
									<span className="text-[#426466]">{type}</span>
									<span className="font-semibold">{count}</span>
								</div>
							))}
						</div>
					</div>

					<div className="p-0">
						<div className="flex items-end justify-between gap-4">
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d8585]">Situation updates</p>
								<h2 className="mt-1 text-xl font-semibold">Active alerts</h2>
							</div>
							<button type="button" onClick={() => setAlertFormOpen(true)} className="inline-flex items-center gap-2 bg-[#1b7775] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#145958]"><Plus className="h-3.5 w-3.5" /> New alert</button>
						</div>
						<div className="mt-6 divide-y divide-[#e0e8e5]">
							{alerts.length === 0 && <p className="text-sm text-[#6d8585]">No active alerts.</p>}
							{alerts.map((alert, index) => (
								<div key={alert.id} className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 py-4 first:pt-0 last:pb-0">
									<span className="pt-0.5 font-mono text-xs text-[#c47d36]">{String(index + 1).padStart(2, "0")}</span>
									<div>
										<p className="font-semibold text-[#284b4e]">{alert.title}</p>
										<p className="mt-1 text-sm leading-6 text-[#6d8585]">{alert.message}</p>
										<p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9a98]">{alert.region} · {alert.severity}</p>
									</div>
									<div className="flex flex-col items-end gap-2"><span className="text-[10px] text-[#8a9a98]">{new Date(alert.createdAt).toLocaleDateString()}</span><button type="button" onClick={() => void deactivateAlert(alert.id)} className="text-[10px] font-semibold text-[#bd5d50] hover:text-[#913f36]">Deactivate</button></div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="p-0">
					<div className="flex items-end justify-between gap-4">
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d8585]">Data administration</p>
							<h2 className="mt-1 text-xl font-semibold">Disaster records</h2>
						</div>
						<button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 bg-[#1b7775] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#145958]">
							<Plus className="h-4 w-4" /> Add disaster
						</button>
					</div>
					<div className="mt-5 overflow-x-auto">
						<table className="w-full min-w-[760px] text-left text-sm">
							<thead className="border-b border-[#d8e2df] text-[10px] uppercase tracking-[0.16em] text-[#6d8585]">
								<tr><th className="pb-3">Name</th><th className="pb-3">Type</th><th className="pb-3">Region</th><th className="pb-3">Severity</th><th className="pb-3">Year</th><th className="pb-3">Actions</th></tr>
							</thead>
							<tbody className="divide-y divide-[#e0e8e5]">
								{disasters.map((disaster) => (
									<tr key={disaster.id}>
										<td className="py-4 font-medium">{disaster.name}</td>
										<td className="py-4 text-[#52686a]">{disaster.type}</td>
										<td className="py-4 text-[#52686a]">{disaster.region}</td>
										<td className="py-4 text-[#52686a]">{disaster.severity}</td>
										<td className="py-4 text-[#52686a]">{disaster.year}</td>
										<td className="py-4"><span className="inline-flex gap-1"><button type="button" onClick={() => openEditForm(disaster)} aria-label={`Edit ${disaster.name}`} className="p-2 text-[#426466] hover:bg-[#e6efec]"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void deleteDisaster(disaster.id)} aria-label={`Delete ${disaster.name}`} className="p-2 text-[#bd5d50] hover:bg-[#f8e7e4]"><Trash2 className="h-4 w-4" /></button></span></td>
									</tr>
								))}
							</tbody>
						</table>
						{disasters.length === 0 && <p className="py-6 text-sm text-[#6d8585]">No disaster records available.</p>}
					</div>
				</section>

			</div>

			{formOpen && (
				<div className="fixed inset-0 z-10 flex items-center justify-center bg-[#18383d]/35 p-6">
					<form onSubmit={saveDisaster} className="w-full max-w-lg bg-[#f8faf9] p-7 shadow-2xl">
						<div className="flex items-start justify-between">
							<div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d8585]">Data administration</p><h2 className="mt-1 text-2xl font-semibold">{editingId ? "Edit disaster" : "Add disaster"}</h2></div>
							<button type="button" onClick={() => setFormOpen(false)} aria-label="Close disaster form" className="p-2 text-[#426466] hover:bg-[#e6efec]"><X className="h-5 w-5" /></button>
						</div>
						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<label className="sm:col-span-2"><span className="text-sm font-medium">Name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]" /></label>
							<label><span className="text-sm font-medium">Type</span><input required value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]" /></label>
							<label><span className="text-sm font-medium">Region</span><input required value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]" /></label>
							<label><span className="text-sm font-medium">Severity</span><select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]"><option>Low</option><option>Medium</option><option>High</option><option>Extreme</option></select></label>
							<label><span className="text-sm font-medium">Year</span><input required type="number" min="1900" max="2100" value={form.year} onChange={(event) => setForm({ ...form, year: Number(event.target.value) })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]" /></label>
						</div>
						<button type="submit" disabled={saving} className="mt-7 w-full bg-[#1b7775] px-4 py-3 text-sm font-semibold text-white hover:bg-[#145958] disabled:opacity-60">{saving ? "Saving..." : editingId ? "Save changes" : "Create disaster"}</button>
					</form>
				</div>
			)}

			{alertFormOpen && (
				<div className="fixed inset-0 z-10 flex items-center justify-center bg-[#18383d]/35 p-6">
					<form onSubmit={createAlert} className="w-full max-w-lg bg-[#f8faf9] p-7 shadow-2xl">
						<div className="flex items-start justify-between">
							<div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d8585]">Situation updates</p><h2 className="mt-1 text-2xl font-semibold">Create alert</h2></div>
							<button type="button" onClick={() => setAlertFormOpen(false)} aria-label="Close alert form" className="p-2 text-[#426466] hover:bg-[#e6efec]"><X className="h-5 w-5" /></button>
						</div>
						<div className="mt-6 space-y-4">
							<label className="block"><span className="text-sm font-medium">Title</span><input required value={alertForm.title} onChange={(event) => setAlertForm({ ...alertForm, title: event.target.value })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]" /></label>
							<label className="block"><span className="text-sm font-medium">Message</span><textarea required rows={4} value={alertForm.message} onChange={(event) => setAlertForm({ ...alertForm, message: event.target.value })} className="mt-1 w-full resize-none border border-[#d8e2df] bg-white px-3 py-2 outline-none focus:border-[#1b7775]" /></label>
							<div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-sm font-medium">Region</span><input required value={alertForm.region} onChange={(event) => setAlertForm({ ...alertForm, region: event.target.value })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]" /></label><label className="block"><span className="text-sm font-medium">Severity</span><select value={alertForm.severity} onChange={(event) => setAlertForm({ ...alertForm, severity: event.target.value })} className="mt-1 w-full border-b border-[#b7cac5] bg-transparent px-1 py-2 outline-none focus:border-[#1b7775]"><option>Low</option><option>Medium</option><option>High</option><option>Extreme</option></select></label></div>
						</div>
						<button type="submit" disabled={savingAlert} className="mt-7 w-full bg-[#1b7775] px-4 py-3 text-sm font-semibold text-white hover:bg-[#145958] disabled:opacity-60">{savingAlert ? "Publishing..." : "Publish alert"}</button>
					</form>
				</div>
			)}
		</main>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="border-b border-[#d8e2df] pb-4">
			<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6d8585]">{label}</div>
			<p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
		</div>
	);
}
