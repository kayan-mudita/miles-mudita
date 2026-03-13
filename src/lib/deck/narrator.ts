import Anthropic from "@anthropic-ai/sdk";

// ── Narrative Types ───────────────────────────────────────────────

export type SlideNarrative = {
  headline: string;
  subtitle: string;
  body: string;
  bullets: string[];
};

export type DeckNarrative = {
  tagline: string;
  slides: {
    problem: SlideNarrative;
    solution: SlideNarrative;
    market: SlideNarrative;
    competition: SlideNarrative;
    business_model: SlideNarrative;
    go_to_market: SlideNarrative;
    why_now: SlideNarrative;
    the_ask: SlideNarrative;
  };
  closing_statement: string;
};

// ── Prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert startup pitch deck writer. You help founders turn research into compelling investor presentations.

You will receive raw research data from a startup validation report. Transform it into a 10-slide investor pitch deck. Do NOT reference scores, validation reports, or research methodology. Write as if the founder is presenting to investors.

CRITICAL CONSTRAINT: The ENTIRE deck must contain NO MORE THAN 250 WORDS total across all slides combined. This means:
- Headlines: 5-8 words max. Bold. Specific. Data-driven when possible.
- Subtitle: ONE short sentence, max 10 words.
- Body: ONE sentence, max 20 words. Just the essential insight.
- Bullets: 3-4 items, each 4-8 words. Think stat callouts, not paragraphs.
- Tagline: Under 10 words.
- Closing: Under 12 words.

The slides should breathe. Let the visuals and white space do the work. Every word must earn its place. Think: Sequoia deck, not a research paper.

The narrative arc:
1. Problem — the pain, in one stat or vivid line
2. Solution — what we build, in one breath
3. Market — how big, how fast
4. Competition — our edge
5. Business Model — how we win financially
6. Go-to-Market — how we reach them
7. Why Now — the timing signal
8. The Ask — what we need

Write in first person plural ("we"). Use concrete numbers from the research. Never mention scores, validation, Miles, or any research tool.

Output ONLY valid JSON (no markdown fences):
{
  "tagline": "Under 10 words",
  "slides": {
    "problem": {
      "headline": "5-8 words, specific, data-driven",
      "subtitle": "Max 10 words",
      "body": "ONE sentence, max 20 words",
      "bullets": ["4-8 words each, 3-4 items"]
    },
    "solution": { "headline": "...", "subtitle": "...", "body": "...", "bullets": ["..."] },
    "market": { "headline": "...", "subtitle": "...", "body": "...", "bullets": ["..."] },
    "competition": { "headline": "...", "subtitle": "...", "body": "...", "bullets": ["..."] },
    "business_model": { "headline": "...", "subtitle": "...", "body": "...", "bullets": ["..."] },
    "go_to_market": { "headline": "...", "subtitle": "...", "body": "...", "bullets": ["..."] },
    "why_now": { "headline": "...", "subtitle": "...", "body": "...", "bullets": ["..."] },
    "the_ask": { "headline": "...", "subtitle": "...", "body": "...", "bullets": ["..."] }
  },
  "closing_statement": "Under 12 words — the vision, not a summary"
}`;

// ── Generator ─────────────────────────────────────────────────────

function truncateFindings(text: string, maxLen = 2500): string {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen) + "...";
}

export async function generateNarrative(
  reportName: string,
  searchTopic: string,
  scores: Record<
    string,
    {
      score: number;
      justification: string;
      strengths: string[];
      weaknesses: string[];
      key_risk: string;
    } | null
  > | null,
  summary: {
    overall_score: number;
    recommendation: string;
    strengths: string[];
    risks: string[];
  } | null,
  introText: string | null,
  dimensionFindings: Record<string, string> | null
): Promise<DeckNarrative> {
  const apiKey =
    process.env.MILES_ANTHROPIC_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    "";

  if (!apiKey) {
    throw new Error("No Anthropic API key configured");
  }

  const client = new Anthropic({
    apiKey,
    baseURL: "https://api.anthropic.com",
  });

  const dimLabels: Record<string, string> = {
    market_environment: "Market Environment",
    competition: "Competitive Landscape",
    cost_difficulty: "Cost & Feasibility",
    product_need: "Product Need & Demand",
    financial_return: "Financial Model & Returns",
  };

  let researchBlock = "";
  for (const [key, label] of Object.entries(dimLabels)) {
    const s = scores?.[key];
    const findings = dimensionFindings?.[key] || "";
    researchBlock += `
### ${label}
Key findings: ${s?.strengths?.join("; ") ?? "N/A"}
Challenges: ${s?.weaknesses?.join("; ") ?? "N/A"}
Critical risk: ${s?.key_risk ?? "N/A"}
Analysis: ${s?.justification ?? "N/A"}
Raw research: ${truncateFindings(findings)}
`;
  }

  const userPrompt = `Transform this research into an investor pitch deck narrative:

**Startup Idea:** ${searchTopic}
**Working Name:** ${reportName}

**Introduction:**
${introText ?? "N/A"}

**Top Strengths (across all dimensions):**
${summary?.strengths?.map((s) => `- ${s}`).join("\n") ?? "N/A"}

**Key Risks:**
${summary?.risks?.map((r) => `- ${r}`).join("\n") ?? "N/A"}

**Research by Dimension:**
${researchBlock}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract JSON
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from narrative response");
  }

  return JSON.parse(jsonMatch[0]) as DeckNarrative;
}
