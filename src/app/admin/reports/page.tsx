"use client";

import { useState, useEffect, useCallback } from "react";

type AdminReport = {
  id: string;
  reportName: string;
  searchTopic: string;
  status: string;
  stage: string;
  progress: number;
  depth: string;
  overallScore: number | null;
  recommendation: string | null;
  marketScore: number | null;
  competitionScore: number | null;
  costScore: number | null;
  productScore: number | null;
  financialScore: number | null;
  createdAt: string;
  completedAt: string | null;
  estimatedMinutes: number;
  error: string | null;
  emailSent: boolean;
  user: { email: string; name: string | null };
};

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-gray-500/20 text-gray-300",
  RUNNING: "bg-yellow-500/20 text-yellow-300",
  COMPLETED: "bg-green-500/20 text-green-300",
  FAILED: "bg-red-500/20 text-red-300",
};

const REC_COLORS: Record<string, string> = {
  GO: "text-green-400",
  "NO-GO": "text-red-400",
  CONDITIONAL: "text-yellow-400",
};

export default function AdminReportsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [depthFilter, setDepthFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Check auth
  useEffect(() => {
    fetch("/api/lab/admin/me")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (depthFilter !== "all") params.set("depth", depthFilter);
      const res = await fetch(`/api/admin/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setTotal(data.total);
        setStatusCounts(data.statusCounts);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, depthFilter]);

  useEffect(() => {
    if (authed) loadReports();
  }, [authed, loadReports]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(loadReports, 30000);
    return () => clearInterval(interval);
  }, [authed, loadReports]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/lab/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) setAuthed(true);
    else setLoginError("Invalid credentials");
  };

  const handleLogout = async () => {
    await fetch("/api/lab/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function duration(created: string, completed: string | null) {
    if (!completed) return "—";
    const ms = new Date(completed).getTime() - new Date(created).getTime();
    const mins = Math.round(ms / 60000);
    return mins < 1 ? "<1m" : `${mins}m`;
  }

  // --- Login screen ---
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-6 h-6 rounded-full border-2 border-cream-100/20 border-t-cream-100 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-xl font-display text-cream-100 text-center mb-2">Admin Dashboard</h1>
          {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-navy-800 border border-gold-500/10 text-cream-100 placeholder:text-cream-300/30 focus:outline-none focus:border-gold-500/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-navy-800 border border-gold-500/10 text-cream-100 placeholder:text-cream-300/30 focus:outline-none focus:border-gold-500/30"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-gold-500 text-navy-950 font-medium hover:bg-gold-400 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  // --- Dashboard ---
  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-screen bg-navy-950 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl">Report Submissions</h1>
            <p className="text-cream-300/50 text-sm font-body mt-1">
              {totalAll} total submissions
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-cream-300/50 hover:text-cream-100 border border-gold-500/10 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(["COMPLETED", "RUNNING", "QUEUED", "FAILED"] as const).map((s) => (
            <div key={s} className="bg-navy-800 border border-gold-500/10 rounded-lg p-4">
              <p className="text-cream-300/50 text-xs font-body uppercase tracking-wider">{s}</p>
              <p className="font-display text-2xl mt-1">{statusCounts[s] || 0}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-sm bg-navy-800 border border-gold-500/10 text-cream-100 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="RUNNING">Running</option>
            <option value="QUEUED">Queued</option>
            <option value="FAILED">Failed</option>
          </select>
          <select
            value={depthFilter}
            onChange={(e) => { setDepthFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-sm bg-navy-800 border border-gold-500/10 text-cream-100 focus:outline-none"
          >
            <option value="all">All Depths</option>
            <option value="QUICK">Quick</option>
            <option value="STANDARD">Standard</option>
            <option value="DEEP">Deep</option>
          </select>
          <button
            onClick={loadReports}
            className="px-3 py-1.5 rounded-lg text-sm bg-navy-800 border border-gold-500/10 text-cream-300/50 hover:text-cream-100 transition-colors"
          >
            Refresh
          </button>
          {loading && (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full border-2 border-cream-100/20 border-t-cream-100 animate-spin" />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gold-500/10 overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gold-500/10 bg-navy-800">
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">Report</th>
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">User</th>
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">Depth</th>
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">Score</th>
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">Rec</th>
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">Duration</th>
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-gold-500/5 hover:bg-navy-800/50">
                  <td className="px-4 py-3">
                    <div className="max-w-[200px]">
                      <p className="text-cream-100 truncate font-medium">{r.reportName}</p>
                      <p className="text-cream-300/30 text-xs truncate">{r.searchTopic}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-cream-100 text-xs">{r.user.name || "—"}</p>
                    <p className="text-cream-300/30 text-xs">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] || ""}`}>
                      {r.status}
                    </span>
                    {r.status === "RUNNING" && (
                      <p className="text-cream-300/30 text-xs mt-0.5">{r.progress}% — {r.stage}</p>
                    )}
                    {r.status === "FAILED" && r.error && (
                      <p className="text-red-400/60 text-xs mt-0.5 max-w-[150px] truncate" title={r.error}>
                        {r.error}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cream-300/50 text-xs uppercase">{r.depth}</td>
                  <td className="px-4 py-3">
                    {r.overallScore != null ? (
                      <span className="text-gold-500 font-display">{r.overallScore.toFixed(1)}</span>
                    ) : (
                      <span className="text-cream-300/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.recommendation ? (
                      <span className={`text-xs font-medium ${REC_COLORS[r.recommendation] || ""}`}>
                        {r.recommendation}
                      </span>
                    ) : (
                      <span className="text-cream-300/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cream-300/50 text-xs">
                    {duration(r.createdAt, r.completedAt)}
                  </td>
                  <td className="px-4 py-3 text-cream-300/50 text-xs whitespace-nowrap">
                    {formatDate(r.createdAt)}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-cream-300/30">
                    No submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm rounded-lg bg-navy-800 border border-gold-500/10 disabled:opacity-30 text-cream-300/50 hover:text-cream-100 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-cream-300/50">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm rounded-lg bg-navy-800 border border-gold-500/10 disabled:opacity-30 text-cream-300/50 hover:text-cream-100 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
