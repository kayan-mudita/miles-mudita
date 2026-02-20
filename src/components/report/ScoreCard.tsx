"use client";

import { motion } from "framer-motion";

type ScoreCardProps = {
  label: string;
  score: number;
  index: number;
};

export default function ScoreCard({ label, score, index }: ScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return "text-green-400";
    if (s >= 6) return "text-gold-500";
    if (s >= 4) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-navy-800 border border-gold-500/15 rounded-lg p-5 text-center"
    >
      <p className="text-gold-500 text-[10px] tracking-[0.2em] uppercase font-body mb-3">
        {label}
      </p>
      <p className={`font-display text-4xl ${getScoreColor(score)}`}>
        {score.toFixed(1)}
      </p>
      <p className="text-cream-300/50 text-xs font-body mt-1">/10</p>
    </motion.div>
  );
}
