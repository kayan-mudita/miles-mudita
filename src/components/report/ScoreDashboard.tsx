"use client";

import { motion } from "framer-motion";
import ScoreCard from "./ScoreCard";

type DimensionScore = {
  key: string;
  label: string;
  score: number;
};

type ScoreDashboardProps = {
  dimensions: DimensionScore[];
  overallScore: number;
  recommendation: "GO" | "NO-GO" | "CONDITIONAL";
};

export default function ScoreDashboard({
  dimensions,
  overallScore,
  recommendation,
}: ScoreDashboardProps) {
  const recStyles = {
    GO: "bg-green-500/20 text-green-400 border-green-500/30",
    "NO-GO": "bg-red-500/20 text-red-400 border-red-500/30",
    CONDITIONAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {dimensions.map((dim, i) => (
          <ScoreCard
            key={dim.key}
            label={dim.label}
            score={dim.score}
            index={i}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <p className="text-cream-300/50 text-xs tracking-[0.3em] uppercase font-body mb-2">
          Overall Score
        </p>
        <p className="font-display text-6xl text-gold-500 mb-3">
          {overallScore.toFixed(1)}
        </p>
        <span
          className={`inline-block px-4 py-1.5 rounded-sm text-sm font-body font-semibold tracking-wider border ${recStyles[recommendation]}`}
        >
          {recommendation}
        </span>
      </motion.div>
    </div>
  );
}
