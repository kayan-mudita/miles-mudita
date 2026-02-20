"use client";

import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";

type ExecutiveSummaryProps = {
  html: string;
  strengths: string[];
  risks: string[];
};

export default function ExecutiveSummary({
  html,
  strengths,
  risks,
}: ExecutiveSummaryProps) {
  return (
    <motion.section
      id="executive-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-navy-800 border border-gold-500/15 rounded-lg p-8 mb-12"
    >
      <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4">
        Executive Summary
      </p>

      <div
        className="font-body text-cream-300 leading-relaxed mb-8
          [&_p]:mb-3 [&_strong]:text-cream-100 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-1.5
          [&_h2]:font-display [&_h2]:text-cream-100 [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:font-display [&_h3]:text-cream-200 [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2
          [&_ol]:ml-4 [&_ol]:list-decimal"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-display text-green-400 text-sm tracking-wider uppercase mb-3">
            Top Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-cream-300">
                <span className="text-green-400 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-red-400 text-sm tracking-wider uppercase mb-3">
            Top Risks
          </h3>
          <ul className="space-y-2">
            {risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-cream-300">
                <span className="text-red-400 mt-0.5">-</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
