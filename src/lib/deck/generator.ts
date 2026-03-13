import { generateNarrative, DeckNarrative } from "./narrator";
import { buildDeck } from "./builder";
import { generateDeckCode } from "./codeGenerator";
import { validateDeckCode, executeDeckCode } from "./codeExecutor";
export type { DimensionScore } from "./builder";

// ── Public Types ──────────────────────────────────────────────────

export type PitchDeckData = {
  reportName: string;
  searchTopic: string;
  intro: {
    title: string;
    introduction: string;
    chapter_1: string;
    chapter_2: string;
    chapter_3: string;
    chapter_4: string;
    chapter_5: string;
  } | null;
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
    strengths: string[];
    risks: string[];
  } | null;
  dimensionFindings?: Record<string, string> | null;
};

// ── Helpers ───────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildFallbackNarrative(data: PitchDeckData): DeckNarrative {
  const makeSlide = (h: string, sub: string, body: string, bullets: string[]) => ({
    headline: h, subtitle: sub, body, bullets,
  });

  return {
    tagline: data.searchTopic,
    slides: {
      problem: makeSlide(
        "The Problem",
        "A gap in the market",
        data.scores?.product_need?.justification ?? "Customers face a significant unmet need.",
        data.scores?.product_need?.strengths?.slice(0, 4) ?? []
      ),
      solution: makeSlide(
        data.reportName,
        "Our approach",
        data.intro?.introduction
          ? stripHtml(data.intro.introduction).slice(0, 200)
          : "We are building a solution to address this gap.",
        []
      ),
      market: makeSlide(
        "Market Opportunity",
        "Large and growing",
        data.scores?.market_environment?.justification ?? "",
        data.scores?.market_environment?.strengths?.slice(0, 4) ?? []
      ),
      competition: makeSlide(
        "Competitive Edge",
        "Our differentiation",
        data.scores?.competition?.justification ?? "",
        data.scores?.competition?.strengths?.slice(0, 4) ?? []
      ),
      business_model: makeSlide(
        "Business Model",
        "How we make money",
        data.scores?.financial_return?.justification ?? "",
        data.scores?.financial_return?.strengths?.slice(0, 4) ?? []
      ),
      go_to_market: makeSlide(
        "Go-to-Market",
        "How we reach customers",
        data.scores?.cost_difficulty?.justification ?? "",
        data.scores?.cost_difficulty?.strengths?.slice(0, 4) ?? []
      ),
      why_now: makeSlide(
        "Why Now",
        "The timing is right",
        "Multiple trends are converging to create this opportunity.",
        data.summary?.strengths?.slice(0, 4) ?? []
      ),
      the_ask: makeSlide(
        "What We Need",
        "Capital and milestones",
        "We are seeking investment to accelerate development and go-to-market.",
        data.scores?.cost_difficulty?.weaknesses?.slice(0, 4) ?? []
      ),
    },
    closing_statement: `The future of ${data.reportName.toLowerCase()} starts now.`,
  };
}

// ── Main Orchestrator — Three-Tier Fallback ───────────────────────

export async function generatePitchDeck(
  data: PitchDeckData
): Promise<Buffer> {
  // ── Tier 1: Claude code-gen → bespoke deck ──
  try {
    console.log("[deck] Tier 1: Generating bespoke deck via Claude code-gen...");
    const code = await generateDeckCode(data);

    const validation = validateDeckCode(code);
    if (!validation.valid) {
      throw new Error(`Code validation failed: ${validation.reason}`);
    }

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    const buffer = await executeDeckCode(code, {
      reportName: data.reportName,
      searchTopic: data.searchTopic,
      date,
    });

    console.log("[deck] Tier 1 SUCCESS — bespoke deck generated");
    return buffer;
  } catch (err) {
    console.error("[deck] Tier 1 FAILED — falling back to template:", err);
  }

  // ── Tier 2: Claude narrative → template deck ──
  try {
    console.log("[deck] Tier 2: Generating narrative + template deck...");
    const introText = data.intro?.introduction
      ? stripHtml(data.intro.introduction).slice(0, 1500)
      : null;

    const narrative = await generateNarrative(
      data.reportName,
      data.searchTopic,
      data.scores,
      data.summary,
      introText,
      data.dimensionFindings ?? null
    );

    const buffer = await buildDeck(
      { reportName: data.reportName, searchTopic: data.searchTopic },
      narrative
    );

    console.log("[deck] Tier 2 SUCCESS — template deck generated");
    return buffer;
  } catch (err) {
    console.error("[deck] Tier 2 FAILED — falling back to static:", err);
  }

  // ── Tier 3: Static fallback narrative → template deck ──
  console.log("[deck] Tier 3: Using static fallback narrative...");
  const narrative = buildFallbackNarrative(data);
  return buildDeck(
    { reportName: data.reportName, searchTopic: data.searchTopic },
    narrative
  );
}
