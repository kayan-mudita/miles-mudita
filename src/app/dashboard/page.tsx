"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import GoldGlow from "@/components/ui/GoldGlow";

type Report = {
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
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  QUEUED: { label: "Queued", color: "text-cream-300/50" },
  RUNNING: { label: "Running", color: "text-gold-500" },
  COMPLETED: { label: "Completed", color: "text-green-400" },
  FAILED: { label: "Failed", color: "text-red-400" },
};

const RECOMMENDATION_STYLES: Record<string, string> = {
  GO: "bg-green-500/20 text-green-400 border-green-500/30",
  "NO-GO": "bg-red-500/20 text-red-400 border-red-500/30",
  CONDITIONAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        setError(null);
        const url = filter === "all" ? "/api/reports" : `/api/reports?status=${filter}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports);
        } else {
          setError("Failed to load reports");
        }
      } catch {
        setError("Failed to load reports. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [filter]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <section className="relative min-h-screen py-16 overflow-hidden">
      <GoldGlow className="top-0 right-0" size="lg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-cream-100">My Reports</h1>
            <p className="text-cream-300/50 text-sm font-body mt-1">
              {reports.length} report{reports.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="filled"
            size="md"
            onClick={() => router.push("/submit")}
          >
            New Report
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6">
          {["all", "COMPLETED", "RUNNING", "FAILED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                filter === f
                  ? "bg-gold-500/20 text-gold-500 border border-gold-500/30"
                  : "bg-navy-800 text-cream-300/50 border border-gold-500/10 hover:border-gold-500/20"
              }`}
            >
              {f === "all" ? "All" : f === "COMPLETED" ? "Completed" : f === "RUNNING" ? "Running" : "Failed"}
            </button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-red-400 font-body mb-4">{error}</p>
            <Button variant="outline" size="md" onClick={() => setFilter(filter)}>
              Retry
            </Button>
          </motion.div>
        )}

        {/* Reports grid */}
        {!error && loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-navy-800 border border-gold-500/10 rounded-lg p-5 animate-pulse h-48"
              />
            ))}
          </div>
        ) : !error && reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-cream-300/50 font-body mb-4">
              No reports yet. Start validating your first idea!
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push("/submit")}
            >
              Create Your First Report
            </Button>
          </motion.div>
        ) : !error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report, i) => {
              const statusInfo = STATUS_LABELS[report.status] || STATUS_LABELS.QUEUED;

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => {
                    if (report.status === "COMPLETED") {
                      router.push(`/report/${report.id}`);
                    } else if (report.status === "RUNNING" || report.status === "QUEUED") {
                      router.push(`/tracking?jobId=${report.id}&name=${encodeURIComponent(report.reportName)}`);
                    }
                  }}
                  className="bg-navy-800 border border-gold-500/15 rounded-lg p-5 cursor-pointer hover:border-gold-500/30 transition-all group"
                >
                  {/* Top row: name + status */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg text-cream-100 group-hover:text-gold-500 transition-colors line-clamp-1">
                      {report.reportName}
                    </h3>
                    <span className={`text-xs font-body flex-shrink-0 ml-2 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Search topic preview */}
                  <p className="text-cream-300/50 text-xs font-body line-clamp-2 mb-4">
                    {report.searchTopic}
                  </p>

                  {/* Score + recommendation for completed reports */}
                  {report.status === "COMPLETED" && report.overallScore != null && (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-gold-500 font-display text-2xl">
                        {report.overallScore.toFixed(1)}
                      </span>
                      <span className="text-cream-300/30 text-sm font-body">/10</span>
                      {report.recommendation && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-body border ${
                            RECOMMENDATION_STYLES[report.recommendation] || ""
                          }`}
                        >
                          {report.recommendation}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Running progress */}
                  {(report.status === "RUNNING" || report.status === "QUEUED") && (
                    <div className="mb-3">
                      <div className="h-1 bg-gold-500/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-500 rounded-full transition-all"
                          style={{ width: `${report.progress}%` }}
                        />
                      </div>
                      <p className="text-cream-300/30 text-xs font-body mt-1">
                        {report.progress}% — {report.stage}
                      </p>
                    </div>
                  )}

                  {/* Failed error */}
                  {report.status === "FAILED" && report.error && (
                    <p className="text-red-400/60 text-xs font-body mb-3 line-clamp-1">
                      {report.error}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-cream-300/30 text-xs font-body">
                    <span>{formatDate(report.createdAt)}</span>
                    <span className="uppercase tracking-wider">{report.depth}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
