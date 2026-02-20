"use client";

import { motion } from "framer-motion";
import GoldGlow from "@/components/ui/GoldGlow";

const benefits = [
  {
    stat: "25+",
    text: "real sources researched per dimension — not summaries of summaries",
  },
  {
    stat: "1-10",
    text: "evidence-based scoring across 12 sub-dimensions with clear reasoning",
  },
  {
    stat: "2x",
    text: "deliverables — a Net-Net one-pager plus a comprehensive scored PDF",
  },
  {
    stat: "Go/No-Go",
    text: "recommendation backed by data, not gut feeling",
  },
];

export default function WhyMiles() {
  return (
    <section className="relative py-32 overflow-hidden">
      <GoldGlow className="top-0 right-0 translate-x-1/2 -translate-y-1/4" size="lg" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-3">
              Why Miles
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-cream-100 mb-4">
              Research that moves at the speed of ambition
            </h2>
            <p className="text-cream-300 font-body mb-10 leading-relaxed">
              Mudita built Miles to give founders the same caliber of diligence
              that institutional investors use internally — without the wait,
              the cost, or the consultants.
            </p>

            <div className="space-y-6">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span className="font-display text-lg text-gold-500 flex-shrink-0 w-20 text-right stat-glow">
                    {b.stat}
                  </span>
                  <span className="text-cream-200 font-body leading-relaxed">
                    {b.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual side - report preview with scan line */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-navy-800 rounded-lg border border-gold-500/15 p-8 overflow-hidden scan-line">
              {/* Report header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gold-500 text-xs tracking-widest uppercase font-body">
                    Miles Report
                  </p>
                  <p className="text-cream-100 font-display text-lg mt-1">
                    AI Pet Food Delivery
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-500">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              </div>

              <div className="gold-rule mb-6" />

              {[
                { label: "Market Environment", score: 8.5 },
                { label: "Competition", score: 6.8 },
                { label: "Cost & Difficulty", score: 7.2 },
                { label: "Product Need", score: 9.1 },
                { label: "Financial Return", score: 7.6 },
              ].map((item, i) => (
                <div key={item.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-cream-200 text-sm font-body">
                      {item.label}
                    </span>
                    <span className="text-gold-500 text-sm font-body font-semibold">
                      {item.score}
                    </span>
                  </div>
                  <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score * 10}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.12, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, #c9a84c, ${item.score >= 8 ? "#f5c542" : item.score >= 7 ? "#d4a843" : "#c9a84c99"})`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-gold-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cream-200 font-body font-semibold">
                    Overall Score
                  </span>
                  <span className="font-display text-3xl text-gold-500 stat-glow">
                    7.8
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-gold-500" />
                  <span className="text-gold-500 text-xs font-body font-semibold tracking-wider uppercase">
                    Proceed with Caution
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
