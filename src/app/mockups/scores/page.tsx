"use client";

import { motion } from "framer-motion";
import ScoreDashboard from "@/components/report/ScoreDashboard";
import ExecutiveSummary from "@/components/report/ExecutiveSummary";
import GoldGlow from "@/components/ui/GoldGlow";
import { DEMO_DIMENSIONS, DEMO_OVERALL_SCORE, DEMO_RECOMMENDATION, DEMO_REPORT } from "../data";

export default function MockupScores() {
  return (
    <section className="relative min-h-screen py-16 overflow-hidden">
      <GoldGlow className="top-0 left-1/2 -translate-x-1/2" size="lg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Report header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-3">
            Research Report
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-cream-100 mb-3">
            {DEMO_REPORT.title}
          </h1>
          <p className="text-cream-300/50 text-sm font-body">
            {DEMO_REPORT.sourceCount} sources researched &middot; {DEMO_REPORT.date}
          </p>
        </motion.div>

        {/* Score Dashboard */}
        <ScoreDashboard
          dimensions={DEMO_DIMENSIONS}
          overallScore={DEMO_OVERALL_SCORE}
          recommendation={DEMO_RECOMMENDATION}
        />

        {/* Executive Summary */}
        <ExecutiveSummary
          html={DEMO_REPORT.executiveSummary}
          strengths={DEMO_REPORT.strengths}
          risks={DEMO_REPORT.risks}
        />
      </div>
    </section>
  );
}
