"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import GoldGlow from "@/components/ui/GoldGlow";
import Button from "@/components/ui/Button";
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

  // Build source groups from context data
  const sourceGroups = DIMENSION_KEYS.map((k) => {
    // Sources come from the context JSON parsed by the content API
    const dimSources =
      (data as Record<string, unknown> & { contextSources?: Record<string, { url: string; title: string; content: string }[]> })
        .contextSources?.[k] ?? [];
    return {
      dimension: DIMENSION_LABELS[k],
      sources: dimSources,
    };
  });

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

            {/* What's Next CTAs */}
            {!isPrint && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-16 mb-8"
              >
                <div className="bg-navy-800 border border-gold-500/15 rounded-lg p-8">
                  <h2 className="font-display text-2xl text-cream-100 mb-2 text-center">
                    What would you like to do next?
                  </h2>
                  <p className="text-cream-300/60 text-sm font-body text-center mb-8">
                    Your report is ready — here are some next steps.
                  </p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a
                      href={`/api/report/${jobId}/pdf`}
                      className="flex items-start gap-3 p-4 rounded-lg border border-gold-500/10 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all group"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500 mt-0.5 flex-shrink-0">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <div>
                        <p className="text-cream-100 font-body text-sm font-medium group-hover:text-gold-500 transition-colors">
                          Download PDF
                        </p>
                        <p className="text-cream-300/50 text-xs font-body mt-0.5">
                          Get a polished copy for your records
                        </p>
                      </div>
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        const btn = document.getElementById("share-toast");
                        if (btn) {
                          btn.textContent = "Link copied!";
                          setTimeout(() => { btn.textContent = "Share This Report"; }, 2000);
                        }
                      }}
                      className="flex items-start gap-3 p-4 rounded-lg border border-gold-500/10 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all group text-left"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500 mt-0.5 flex-shrink-0">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      <div>
                        <p id="share-toast" className="text-cream-100 font-body text-sm font-medium group-hover:text-gold-500 transition-colors">
                          Share This Report
                        </p>
                        <p className="text-cream-300/50 text-xs font-body mt-0.5">
                          Copy the link to share with your team
                        </p>
                      </div>
                    </button>

                    <a
                      href="/submit"
                      className="flex items-start gap-3 p-4 rounded-lg border border-gold-500/10 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all group"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500 mt-0.5 flex-shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <div>
                        <p className="text-cream-100 font-body text-sm font-medium group-hover:text-gold-500 transition-colors">
                          Validate Another Idea
                        </p>
                        <p className="text-cream-300/50 text-xs font-body mt-0.5">
                          Run Miles on a different concept
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.section>
            )}
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
