"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import GoldGlow from "@/components/ui/GoldGlow";
import ScoreDashboard from "@/components/report/ScoreDashboard";
import ExecutiveSummary from "@/components/report/ExecutiveSummary";
import ChapterSection from "@/components/report/ChapterSection";
import TableOfContents from "@/components/report/TableOfContents";
import SourcesList from "@/components/report/SourcesList";

const DIMENSION_LABELS: Record<string, string> = {
  market_environment: "Market Environment",
  competition: "Competition",
  cost_difficulty: "Cost & Difficulty",
  product_need: "Product Need",
  financial_return: "Financial Return",
};

const DIMENSION_KEYS = [
  "market_environment",
  "competition",
  "cost_difficulty",
  "product_need",
  "financial_return",
];

type ReportData = {
  id: string;
  status: string;
  report: string;
  scores: Record<
    string,
    {
      score: number;
      justification: string;
      strengths: string[];
      weaknesses: string[];
      key_risk: string;
    } | null
  > | null;
  summary: {
    overall_score: number;
    recommendation: "GO" | "NO-GO" | "CONDITIONAL";
    executive_summary_html: string;
    scoring_table_html: string;
    strengths: string[];
    risks: string[];
  } | null;
  intro: {
    title: string;
    introduction: string;
    chapter_1: string;
    chapter_2: string;
    chapter_3: string;
    chapter_4: string;
    chapter_5: string;
  } | null;
  totalSources: number;
};

export default function ReportPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const searchParams = useSearchParams();
  const isPrint = searchParams.get("print") === "true";
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/report/${jobId}/content`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load report");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    if (jobId) fetchReport();
  }, [jobId]);

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-body mb-4">{error || "Report not found"}</p>
          <a href="/submit" className="text-gold-500 font-body hover:underline">
            Submit a new idea
          </a>
        </div>
      </div>
    );
  }

  const { scores, summary, intro } = data;

  // Build dimension scores for dashboard
  const dimensionScores = DIMENSION_KEYS.map((k) => ({
    key: k,
    label: DIMENSION_LABELS[k],
    score: scores?.[k]?.score ?? 0,
  }));

  // Build chapter headings
  const chapterHeadings = DIMENSION_KEYS.map((k, i) => {
    const key = `chapter_${i + 1}` as keyof NonNullable<typeof intro>;
    return intro?.[key] || DIMENSION_LABELS[k];
  });

  // Build TOC items
  const tocItems = [
    { id: "executive-summary", label: "Executive Summary" },
    ...chapterHeadings.map((h, i) => ({
      id: `chapter-${i + 1}`,
      label: h,
    })),
    { id: "scoring-details", label: "Detailed Scoring" },
    { id: "sources", label: "Sources" },
  ];

  // Extract chapter HTML from the full report
  // The assembler wraps each in <section class="chapter" id="chapter-N">
  const chapterHtmls = DIMENSION_KEYS.map((_, i) => {
    const regex = new RegExp(
      `<section class="chapter" id="chapter-${i + 1}">([\\s\\S]*?)</section>`,
      "i"
    );
    const match = data.report.match(regex);
    if (match) {
      // Strip the wrapping h2
      return match[1].replace(/<h2>.*?<\/h2>/i, "").trim();
    }
    return "";
  });

  // Build source groups from scores
  const sourceGroups = DIMENSION_KEYS.map((k) => ({
    dimension: DIMENSION_LABELS[k],
    sources: [] as { url: string; title: string; content: string }[],
  }));

  return (
    <section
      data-report-content
      className={`relative min-h-screen py-16 overflow-hidden ${isPrint ? "print-mode" : ""}`}
      style={isPrint ? { background: "#fff", color: "#1a1a2e" } : undefined}
    >
      {!isPrint && (
        <GoldGlow
          className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          size="lg"
        />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4">
            Research Report
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-cream-100 mb-3">
            {intro?.title || "Research Report"}
          </h1>
          <p className="text-cream-300/60 text-sm font-body">
            {data.totalSources} Sources
            {formattedDate && <> &middot; {formattedDate}</>}
          </p>
        </motion.div>

        {/* Score Dashboard */}
        {summary && (
          <ScoreDashboard
            dimensions={dimensionScores}
            overallScore={summary.overall_score}
            recommendation={summary.recommendation}
          />
        )}

        {/* Executive Summary */}
        {summary && (
          <ExecutiveSummary
            html={summary.executive_summary_html}
            strengths={summary.strengths}
            risks={summary.risks}
          />
        )}

        {/* Main content with optional TOC sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
          <div>
            {/* Introduction */}
            {intro?.introduction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12 font-body text-cream-300 leading-relaxed text-lg [&_p]:mb-4 [&_strong]:text-cream-100"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(intro.introduction) }}
              />
            )}

            {/* Chapters */}
            {chapterHeadings.map((heading, i) => (
              <ChapterSection
                key={i}
                index={i}
                heading={heading}
                html={chapterHtmls[i]}
              />
            ))}

            {/* Detailed Scoring */}
            <section id="scoring-details" className="mb-16">
              <h2 className="font-display text-2xl text-cream-100 mb-6">
                Detailed Scoring
              </h2>
              {summary?.scoring_table_html && (
                <div
                  className="mb-8 font-body text-cream-300 [&_table]:w-full [&_table]:border-collapse [&_th]:bg-navy-800 [&_th]:border [&_th]:border-gold-500/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-cream-100 [&_th]:text-sm [&_td]:border [&_td]:border-gold-500/10 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(summary.scoring_table_html) }}
                />
              )}
              {DIMENSION_KEYS.map((k) => {
                const s = scores?.[k];
                if (!s) return null;
                return (
                  <div
                    key={k}
                    className="bg-navy-800 border border-gold-500/15 rounded-lg p-6 mb-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-lg text-cream-100">
                        {DIMENSION_LABELS[k]}
                      </h3>
                      <span className="text-gold-500 font-display text-2xl">
                        {s.score.toFixed(1)}/10
                      </span>
                    </div>
                    <p className="text-cream-300 text-sm font-body mb-4">
                      {s.justification}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-green-400 font-body text-xs uppercase tracking-wider mb-2">
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {s.strengths.map((str, i) => (
                            <li key={i} className="text-cream-300 font-body flex gap-2">
                              <span className="text-green-400">+</span> {str}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-red-400 font-body text-xs uppercase tracking-wider mb-2">
                          Weaknesses
                        </p>
                        <ul className="space-y-1">
                          {s.weaknesses.map((w, i) => (
                            <li key={i} className="text-cream-300 font-body flex gap-2">
                              <span className="text-red-400">-</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="text-red-400/80 text-sm font-body mt-3 italic">
                      Key Risk: {s.key_risk}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* Sources */}
            <SourcesList groups={sourceGroups} totalCount={data.totalSources} />
          </div>

          {/* Sticky TOC (desktop only, hidden in print mode) */}
          {!isPrint && (
            <div className="hidden lg:block">
              <TableOfContents items={tocItems} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
