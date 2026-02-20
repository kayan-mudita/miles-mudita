"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import GoldGlow from "@/components/ui/GoldGlow";
import Button from "@/components/ui/Button";

type CompareReport = {
  id: string;
  reportName: string;
  searchTopic: string;
  depth: string;
  overallScore: number | null;
  recommendation: string | null;
  marketScore: number | null;
  competitionScore: number | null;
  costScore: number | null;
  productScore: number | null;
  financialScore: number | null;
  createdAt: string;
};

const DIMENSIONS = [
  { key: "marketScore", label: "Market Environment" },
  { key: "competitionScore", label: "Competition" },
  { key: "costScore", label: "Cost & Difficulty" },
  { key: "productScore", label: "Product Need" },
  { key: "financialScore", label: "Financial Return" },
];

const REC_STYLES: Record<string, string> = {
  GO: "bg-green-500/20 text-green-400 border border-green-500/30",
  "NO-GO": "bg-red-500/20 text-red-400 border border-red-500/30",
  CONDITIONAL: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-cream-300/50 font-body">Loading comparison...</p></div>}>
      <ComparePageInner />
    </Suspense>
  );
}

function ComparePageInner() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<CompareReport[]>([]);
  const [allReports, setAllReports] = useState<CompareReport[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's completed reports for selection
  useEffect(() => {
    async function loadAll() {
      try {
        setError(null);
        const res = await fetch("/api/reports?status=COMPLETED");
        if (res.ok) {
          const data = await res.json();
          setAllReports(data.reports);
        } else {
          setError("Failed to load reports");
        }
      } catch {
        setError("Failed to load reports. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Load from URL params if present
  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      const idList = ids.split(",");
      setSelectedIds(idList);
      loadComparison(idList);
    }
  }, [searchParams]);

  async function loadComparison(ids: string[]) {
    if (ids.length < 2) return;
    const res = await fetch(`/api/reports/compare?ids=${ids.join(",")}`);
    if (res.ok) {
      const data = await res.json();
      setReports(data.reports);
    }
  }

  function toggleReport(id: string) {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (next.length >= 2) loadComparison(next);
      else setReports([]);
      return next;
    });
  }

  function getScoreColor(score: number | null): string {
    if (score == null) return "text-cream-300/30";
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-gold-500";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
  }

  return (
    <section className="relative min-h-screen py-16 overflow-hidden">
      <GoldGlow className="top-0 left-1/2 -translate-x-1/2" size="lg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <h1 className="font-display text-3xl text-cream-100 mb-2">Compare Reports</h1>
        <p className="text-cream-300/50 text-sm font-body mb-8">
          Select 2-5 reports to compare side by side
        </p>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 font-body mb-4">{error}</p>
            <Button href="/dashboard" variant="outline" size="md">
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Report selector */}
        {!searchParams.get("ids") && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {allReports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggleReport(r.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-body transition-all ${
                    selectedIds.includes(r.id)
                      ? "bg-gold-500/20 text-gold-500 border border-gold-500/30"
                      : "bg-navy-800 text-cream-300/60 border border-gold-500/10 hover:border-gold-500/20"
                  }`}
                >
                  {r.reportName}
                  {r.overallScore != null && (
                    <span className="ml-1.5 text-cream-300/30">({r.overallScore.toFixed(1)})</span>
                  )}
                </button>
              ))}
            </div>
            {allReports.length === 0 && !loading && (
              <p className="text-cream-300/30 text-sm font-body mt-4">
                No completed reports to compare. Create some reports first!
              </p>
            )}
          </div>
        )}

        {/* Comparison table */}
        {reports.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-cream-300/50 text-xs font-body uppercase tracking-wider p-3 border-b border-gold-500/10">
                    Dimension
                  </th>
                  {reports.map((r) => (
                    <th
                      key={r.id}
                      className="text-center text-cream-100 text-sm font-display p-3 border-b border-gold-500/10 min-w-[140px]"
                    >
                      <div className="line-clamp-1">{r.reportName}</div>
                      <div className="text-cream-300/30 text-xs font-body mt-0.5 uppercase">
                        {r.depth}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Overall score row */}
                <tr className="bg-navy-800/50">
                  <td className="text-cream-100 font-display text-sm p-3 border-b border-gold-500/10">
                    Overall Score
                  </td>
                  {reports.map((r) => (
                    <td key={r.id} className="text-center p-3 border-b border-gold-500/10">
                      <span className={`font-display text-2xl ${getScoreColor(r.overallScore)}`}>
                        {r.overallScore?.toFixed(1) ?? "—"}
                      </span>
                      <span className="text-cream-300/30 text-xs">/10</span>
                    </td>
                  ))}
                </tr>

                {/* Recommendation row */}
                <tr>
                  <td className="text-cream-300 text-sm font-body p-3 border-b border-gold-500/10">
                    Recommendation
                  </td>
                  {reports.map((r) => (
                    <td key={r.id} className="text-center p-3 border-b border-gold-500/10">
                      {r.recommendation ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-body ${REC_STYLES[r.recommendation] || ""}`}>
                          {r.recommendation}
                        </span>
                      ) : (
                        <span className="text-cream-300/30">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Dimension scores */}
                {DIMENSIONS.map((dim) => (
                  <tr key={dim.key}>
                    <td className="text-cream-300 text-sm font-body p-3 border-b border-gold-500/10">
                      {dim.label}
                    </td>
                    {reports.map((r) => {
                      const score = r[dim.key as keyof CompareReport] as number | null;
                      return (
                        <td key={r.id} className="text-center p-3 border-b border-gold-500/10">
                          <span className={`font-display text-lg ${getScoreColor(score)}`}>
                            {score?.toFixed(1) ?? "—"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {selectedIds.length >= 2 && reports.length === 0 && !loading && (
          <p className="text-cream-300/30 text-sm font-body text-center mt-8">
            Loading comparison...
          </p>
        )}

        <div className="mt-8">
          <Button href="/dashboard" variant="outline" size="md">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}
