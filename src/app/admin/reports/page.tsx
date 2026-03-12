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

type ReportDetail = AdminReport & {
  detail: string;
  updatedAt: string;
  emailSentAt: string | null;
  executiveSummary: string | null;
  scoringTable: string | null;
  topStrengths: string[];
  topRisks: string[];
  user: { id: string; email: string; name: string | null; createdAt: string };
  team: { id: string; name: string } | null;
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

const REC_BG: Record<string, string> = {
  GO: "bg-green-500/10 border-green-500/20",
  "NO-GO": "bg-red-500/10 border-red-500/20",
  CONDITIONAL: "bg-yellow-500/10 border-yellow-500/20",
};

const DIMENSION_LABELS: Record<string, string> = {
  marketScore: "Market Environment",
  competitionScore: "Competition",
  costScore: "Cost & Difficulty",
  productScore: "Product Need",
  financialScore: "Financial Return",
};

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (score == null) return null;
  const pct = (score / 10) * 100;
  const color =
    score >= 7 ? "bg-green-500" : score >= 5 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-cream-300/50 text-xs w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-cream-100 text-sm font-display w-8 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

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

  // Detail panel
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // Load detail when row is clicked
  const loadDetail = useCallback(async (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data.report);
      }
    } finally {
      setDetailLoading(false);
    }
  }, [selectedId]);

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

  function formatFullDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
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
            <button
              key={s}
              onClick={() => { setStatusFilter(statusFilter === s ? "all" : s); setPage(1); }}
              className={`bg-navy-800 border rounded-lg p-4 text-left transition-colors ${
                statusFilter === s ? "border-gold-500/40" : "border-gold-500/10 hover:border-gold-500/20"
              }`}
            >
              <p className="text-cream-300/50 text-xs font-body uppercase tracking-wider">{s}</p>
              <p className="font-display text-2xl mt-1">{statusCounts[s] || 0}</p>
            </button>
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
        <div className="rounded-xl border border-gold-500/10 overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gold-500/10 bg-navy-800">
                <th className="text-left px-4 py-3 text-cream-300/50 font-medium w-8"></th>
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
                <>
                  <tr
                    key={r.id}
                    onClick={() => loadDetail(r.id)}
                    className={`border-b border-gold-500/5 cursor-pointer transition-colors ${
                      selectedId === r.id ? "bg-navy-800/80" : "hover:bg-navy-800/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-cream-300/30">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform ${selectedId === r.id ? "rotate-90" : ""}`}
                      >
                        <path d="M4 2l4 4-4 4" />
                      </svg>
                    </td>
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

                  {/* Expanded detail row */}
                  {selectedId === r.id && (
                    <tr key={`${r.id}-detail`}>
                      <td colSpan={9} className="px-0 py-0">
                        <div className="bg-navy-900 border-y border-gold-500/10 px-6 py-5">
                          {detailLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-5 h-5 rounded-full border-2 border-cream-100/20 border-t-cream-100 animate-spin" />
                            </div>
                          ) : detail ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Left column — idea details */}
                              <div className="lg:col-span-2 space-y-5">
                                {/* Idea description */}
                                <div>
                                  <h3 className="text-xs text-cream-300/50 uppercase tracking-wider mb-2">Full Idea Description</h3>
                                  <p className="text-cream-100 text-sm leading-relaxed whitespace-pre-wrap bg-navy-800 rounded-lg p-4 border border-gold-500/10">
                                    {detail.searchTopic}
                                  </p>
                                </div>

                                {/* Score breakdown */}
                                {detail.overallScore != null && (
                                  <div>
                                    <h3 className="text-xs text-cream-300/50 uppercase tracking-wider mb-3">Score Breakdown</h3>
                                    <div className="bg-navy-800 rounded-lg p-4 border border-gold-500/10 space-y-2.5">
                                      {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
                                        <ScoreBar
                                          key={key}
                                          label={label}
                                          score={detail[key as keyof ReportDetail] as number | null}
                                        />
                                      ))}
                                      <div className="border-t border-gold-500/10 pt-2.5 mt-2.5 flex items-center gap-3">
                                        <span className="text-cream-100 text-xs w-36 shrink-0 font-medium">Overall</span>
                                        <div className="flex-1" />
                                        <span className="text-gold-500 font-display text-lg">{detail.overallScore.toFixed(1)}</span>
                                        <span className="text-cream-300/30 text-sm">/10</span>
                                        {detail.recommendation && (
                                          <span className={`ml-2 px-2.5 py-0.5 rounded text-xs font-medium border ${REC_BG[detail.recommendation] || ""} ${REC_COLORS[detail.recommendation] || ""}`}>
                                            {detail.recommendation}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Strengths & Risks */}
                                {(detail.topStrengths.length > 0 || detail.topRisks.length > 0) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {detail.topStrengths.length > 0 && (
                                      <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4">
                                        <h4 className="text-green-400 text-xs uppercase tracking-wider mb-2">Top Strengths</h4>
                                        <ul className="space-y-1.5">
                                          {detail.topStrengths.map((s, i) => (
                                            <li key={i} className="text-cream-100 text-xs leading-relaxed flex gap-2">
                                              <span className="text-green-500 shrink-0">+</span>
                                              {s}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {detail.topRisks.length > 0 && (
                                      <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                                        <h4 className="text-red-400 text-xs uppercase tracking-wider mb-2">Top Risks</h4>
                                        <ul className="space-y-1.5">
                                          {detail.topRisks.map((r, i) => (
                                            <li key={i} className="text-cream-100 text-xs leading-relaxed flex gap-2">
                                              <span className="text-red-500 shrink-0">!</span>
                                              {r}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Error details for failed */}
                                {detail.status === "FAILED" && detail.error && (
                                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                                    <h3 className="text-red-400 text-xs uppercase tracking-wider mb-2">Error</h3>
                                    <p className="text-red-300 text-xs font-mono whitespace-pre-wrap">{detail.error}</p>
                                  </div>
                                )}
                              </div>

                              {/* Right column — metadata */}
                              <div className="space-y-4">
                                <div className="bg-navy-800 rounded-lg p-4 border border-gold-500/10 space-y-3">
                                  <h3 className="text-xs text-cream-300/50 uppercase tracking-wider mb-1">Details</h3>

                                  <div>
                                    <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Report ID</p>
                                    <p className="text-cream-100 text-xs font-mono">{detail.id}</p>
                                  </div>

                                  <div>
                                    <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">User</p>
                                    <p className="text-cream-100 text-xs">{detail.user.name || "—"}</p>
                                    <p className="text-cream-300/50 text-xs">{detail.user.email}</p>
                                    <p className="text-cream-300/30 text-[10px]">Joined {formatFullDate(detail.user.createdAt)}</p>
                                  </div>

                                  {detail.team && (
                                    <div>
                                      <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Team</p>
                                      <p className="text-cream-100 text-xs">{detail.team.name}</p>
                                    </div>
                                  )}

                                  <div>
                                    <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Depth</p>
                                    <p className="text-cream-100 text-xs uppercase">{detail.depth}</p>
                                  </div>

                                  <div>
                                    <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Estimated Time</p>
                                    <p className="text-cream-100 text-xs">{detail.estimatedMinutes} min</p>
                                  </div>

                                  <div>
                                    <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Actual Duration</p>
                                    <p className="text-cream-100 text-xs">{duration(detail.createdAt, detail.completedAt)}</p>
                                  </div>

                                  <div>
                                    <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Submitted</p>
                                    <p className="text-cream-100 text-xs">{formatFullDate(detail.createdAt)}</p>
                                  </div>

                                  {detail.completedAt && (
                                    <div>
                                      <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Completed</p>
                                      <p className="text-cream-100 text-xs">{formatFullDate(detail.completedAt)}</p>
                                    </div>
                                  )}

                                  <div>
                                    <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Email Sent</p>
                                    <p className="text-cream-100 text-xs">
                                      {detail.emailSent ? `Yes — ${detail.emailSentAt ? formatFullDate(detail.emailSentAt) : ""}` : "No"}
                                    </p>
                                  </div>

                                  {detail.status === "RUNNING" && (
                                    <div>
                                      <p className="text-cream-300/30 text-[10px] uppercase tracking-wider">Progress</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                                          <div className="h-full bg-gold-500 rounded-full" style={{ width: `${detail.progress}%` }} />
                                        </div>
                                        <span className="text-cream-100 text-xs">{detail.progress}%</span>
                                      </div>
                                      <p className="text-cream-300/50 text-xs mt-0.5">{detail.stage} — {detail.detail}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                {detail.status === "COMPLETED" && (
                                  <a
                                    href={`/report/${detail.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center px-4 py-2.5 rounded-lg bg-gold-500/10 text-gold-500 border border-gold-500/20 text-sm hover:bg-gold-500/20 transition-colors"
                                  >
                                    View Full Report
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-cream-300/30 text-center py-4">Failed to load details</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {reports.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-cream-300/30">
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
