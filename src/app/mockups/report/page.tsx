"use client";

import { motion } from "framer-motion";
import ScoreDashboard from "@/components/report/ScoreDashboard";
import ExecutiveSummary from "@/components/report/ExecutiveSummary";
import ChapterSection from "@/components/report/ChapterSection";
import SourcesList from "@/components/report/SourcesList";
import GoldGlow from "@/components/ui/GoldGlow";
import {
  DEMO_DIMENSIONS,
  DEMO_OVERALL_SCORE,
  DEMO_RECOMMENDATION,
  DEMO_REPORT,
} from "../data";

const TOC_ITEMS = [
  { id: "scores", label: "Scores" },
  { id: "executive-summary", label: "Executive Summary" },
  { id: "chapter-1", label: "Market Environment" },
  { id: "sources", label: "Sources" },
];

export default function MockupReport() {
  const totalSources = DEMO_REPORT.sources.reduce(
    (acc, g) => acc + g.sources.length,
    0
  );

  return (
    <section className="relative min-h-screen py-16 overflow-hidden">
      <GoldGlow className="top-0 left-1/2 -translate-x-1/2" size="lg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex gap-12">
          {/* TOC Sidebar */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-body mb-4">
                Contents
              </p>
              <nav className="space-y-2">
                {TOC_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-cream-300/50 text-sm font-body hover:text-gold-500 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
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
                {DEMO_REPORT.sourceCount} sources researched &middot;{" "}
                {DEMO_REPORT.date}
              </p>
            </motion.div>

            {/* Score Dashboard */}
            <div id="scores">
              <ScoreDashboard
                dimensions={DEMO_DIMENSIONS}
                overallScore={DEMO_OVERALL_SCORE}
                recommendation={DEMO_RECOMMENDATION}
              />
            </div>

            {/* Executive Summary */}
            <ExecutiveSummary
              html={DEMO_REPORT.executiveSummary}
              strengths={DEMO_REPORT.strengths}
              risks={DEMO_REPORT.risks}
            />

            {/* Chapters */}
            {DEMO_REPORT.chapters.map((chapter, i) => (
              <ChapterSection
                key={i}
                index={i}
                heading={chapter.heading}
                html={chapter.html}
              />
            ))}

            {/* Sources */}
            <SourcesList
              groups={DEMO_REPORT.sources}
              totalCount={totalSources}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
