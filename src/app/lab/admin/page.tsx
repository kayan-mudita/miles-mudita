"use client";

import { useState, useEffect } from "react";
import { LabNav } from "@/components/lab/LabNav";

interface WaitlistEntry {
  id: number;
  email: string;
  ideaId: number | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
}

export default function LabAdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Check auth on mount
  useEffect(() => {
    fetch("/api/lab/admin/me")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  // Load waitlist when authed
  useEffect(() => {
    if (!authed) return;
    fetch(`/api/lab/admin/waitlist?page=${page}&limit=50`)
      .then((r) => r.json())
      .then((d) => { setEntries(d.entries); setTotal(d.total); });
  }, [authed, page]);

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
    setEntries([]);
  };

  if (authed === null) {
    return (
      <>
        <LabNav />
        <div className="pt-14 min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      </>
    );
  }

  if (!authed) {
    return (
      <>
        <LabNav />
        <div className="pt-14 min-h-screen flex items-center justify-center px-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
            <h1 className="text-xl font-bold text-center mb-2">Lab Admin</h1>
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <LabNav />
      <div className="pt-14 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Lab Admin</h1>
              <p className="text-white/50 text-sm mt-1">{total} waitlist entries</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/api/lab/admin/waitlist/export"
                className="px-4 py-2 text-sm rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Export CSV
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-lg bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Idea ID</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">UTM Source</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{e.email}</td>
                    <td className="px-4 py-3 text-white/50">{e.ideaId ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50">{e.utmSource ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-white/30">No entries yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {total > 50 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg bg-white/10 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-white/50">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 50 >= total}
                className="px-4 py-2 text-sm rounded-lg bg-white/10 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
