"use client";

import { motion } from "framer-motion";
import GoldGlow from "@/components/ui/GoldGlow";
import { DEMO_COMPARE_REPORTS } from "../data";

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

function getScoreColor(score: number | null): string {
  if (score == null) return "text-cream-300/30";
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-gold-500";
  if (score >= 4) return "text-yellow-400";
  return "text-red-400";
}

export default function MockupCompare() {
  return (
    <section className="relative min-h-screen py-16 overflow-hidden">
      <GoldGlow className="top-0 left-1/2 -translate-x-1/2" size="lg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl text-cream-100 mb-2">
            Compare Reports
          </h1>
          <p className="text-cream-300/50 text-sm font-body mb-8">
            Side-by-side analysis of 3 startup concepts
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-cream-300/50 text-xs font-body uppercase tracking-wider p-3 border-b border-gold-500/10">
                  Dimension
                </th>
                {DEMO_COMPARE_REPORTS.map((r) => (
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
                {DEMO_COMPARE_REPORTS.map((r) => (
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
                {DEMO_COMPARE_REPORTS.map((r) => (
                  <td key={r.id} className="text-center p-3 border-b border-gold-500/10">
                    {r.recommendation ? (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-body ${
                          REC_STYLES[r.recommendation] || ""
                        }`}
                      >
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
                  {DEMO_COMPARE_REPORTS.map((r) => {
                    const score = r[dim.key as keyof typeof r] as number | null;
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
      </div>
    </section>
  );
}
