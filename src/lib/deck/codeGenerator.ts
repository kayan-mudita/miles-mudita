import Anthropic from "@anthropic-ai/sdk";
import { SKILL_PROMPT } from "./skillPrompt";
import type { PitchDeckData } from "./generator";

// ── Helpers ──────────────────────────────────────────────────────

function truncate(text: string, max: number): string {
  if (!text || text.length <= max) return text || "";
  return text.slice(0, max) + "...";
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
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

// ── Storyboard Assembly ──────────────────────────────────────────

function buildStoryboard(data: PitchDeckData): string {
  const scores = data.scores ?? {};
  const findings = data.dimensionFindings ?? {};
  const summary = data.summary;
  const intro = data.intro;

  const pn = scores.product_need;
  const me = scores.market_environment;
  const co = scores.competition;
  const fr = scores.financial_return;
  const cd = scores.cost_difficulty;

  return `
## REPORT DATA FOR STORYBOARD

**Startup Name:** ${data.reportName}
**Search Topic:** ${data.searchTopic}

---

### SLIDE 1 (Title) — HERO layout, Battle Cry
Name: ${data.reportName}
Topic: ${data.searchTopic}
Generate a battle cry: a short, memorable slogan about the CUSTOMER's transformation, not the company. Max 8 words.

---

### SLIDE 2 (The Problem) — HERO STATEMENT layout
P.C.T. Role: PROBLEM — make them FEEL the pain
Emotional pain: ${pn?.justification ?? "N/A"}
Pain signals: ${pn?.weaknesses?.join("; ") ?? "N/A"}
Key risk: ${pn?.key_risk ?? "N/A"}
Research: ${truncate(findings.product_need ?? "", 1500)}

---

### SLIDE 3 (The Landscape) — STAT CALLOUT ROW layout
P.C.T. Role: PROBLEM → CREDIBILITY transition
Market data: ${me?.justification ?? "N/A"}
Market strengths: ${me?.strengths?.join("; ") ?? "N/A"}
Competition gaps: ${co?.weaknesses?.join("; ") ?? "N/A"}
Research: ${truncate(findings.market_environment ?? "", 1200)}

---

### SLIDE 4 (The Solution) — SPLIT TWO-COLUMN layout
P.C.T. Role: CREDIBILITY — what we build
Introduction: ${intro?.introduction ? stripHtml(intro.introduction).slice(0, 800) : "N/A"}
Topic: ${data.searchTopic}
Chapter summaries: ${intro ? [intro.chapter_1, intro.chapter_2, intro.chapter_3].filter(Boolean).map(c => stripHtml(c ?? "").slice(0, 150)).join(" | ") : "N/A"}

---

### SLIDE 5 (Why Us) — CARD GRID 1x3 layout
P.C.T. Role: CREDIBILITY — our differentiators
Competition strengths (our moat): ${co?.strengths?.join("; ") ?? "N/A"}
Competition justification: ${co?.justification ?? "N/A"}
Research: ${truncate(findings.competition ?? "", 1000)}

---

### SLIDE 6 (The Model) — SPLIT TWO-COLUMN layout
P.C.T. Role: CREDIBILITY — financial viability
Financial strengths: ${fr?.strengths?.join("; ") ?? "N/A"}
Financial justification: ${fr?.justification ?? "N/A"}
Financial weaknesses: ${fr?.weaknesses?.join("; ") ?? "N/A"}
Research: ${truncate(findings.financial_return ?? "", 1000)}

---

### SLIDE 7 (The Path) — TIMELINE layout
P.C.T. Role: CREDIBILITY → TRANSFORMATION transition
GTM strengths: ${cd?.strengths?.join("; ") ?? "N/A"}
Feasibility: ${cd?.justification ?? "N/A"}
Challenges: ${cd?.weaknesses?.join("; ") ?? "N/A"}
Research: ${truncate(findings.cost_difficulty ?? "", 1000)}

---

### SLIDE 8 (The Transformation) — FULL-BLEED QUOTE layout
P.C.T. Role: TRANSFORMATION — paint the world after we win
Use aspirational language: relieved, confident, inspired, optimistic, empowered.
Draw from ALL dimensions:
Top strengths: ${summary?.strengths?.join("; ") ?? "N/A"}
Overall recommendation: ${summary?.recommendation ?? "N/A"}

---

### SLIDE 9 (The Ask) — CARD GRID 2x2 layout
P.C.T. Role: TRANSFORMATION — what we need
Key risks to address: ${summary?.risks?.join("; ") ?? "N/A"}
Cost challenges: ${cd?.weaknesses?.join("; ") ?? "N/A"}
Key risk: ${cd?.key_risk ?? "N/A"}

---

### SLIDE 10 (Closing) — HERO layout, Battle Cry reprise
Reprise the battle cry from slide 1.
Name: ${data.reportName}
Vision: The transformation in one sentence.
`.trim();
}

// ── Claude API Call ──────────────────────────────────────────────

export async function generateDeckCode(data: PitchDeckData): Promise<string> {
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

  const storyboard = buildStoryboard(data);

  const userPrompt = `Write the complete function body (PptxGenJS code) for a 10-slide investor pitch deck.

${storyboard}

REMEMBER:
- Output ONLY executable JavaScript — no markdown fences, no imports, no explanations
- 10 slides total, each with a DIFFERENT visual layout
- Follow the P.C.T. narrative arc
- MAX 250 words across all slides
- Battle cry on slides 1 and 10
- Use the Mudita design system colors (no "#" prefix)
- Define addFooter() and makeShadow() helpers at the top
- Call addFooter on slides 2-9
- Every text element needs margin: 0
- Use data.reportName, data.searchTopic, data.date where appropriate`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16384,
    system: SKILL_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return extractCode(text);
}

// ── Code Extraction ──────────────────────────────────────────────

function extractCode(raw: string): string {
  // Strip markdown fences if present
  let code = raw;
  const fenceMatch = code.match(/```(?:javascript|js|typescript|ts)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    code = fenceMatch[1];
  }

  // If the response starts with explanation text, find the first code-like line
  const lines = code.split("\n");
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      line.startsWith("const ") ||
      line.startsWith("let ") ||
      line.startsWith("var ") ||
      line.startsWith("function ") ||
      line.startsWith("//") ||
      line.startsWith("pres.") ||
      line.startsWith("{")
    ) {
      startIdx = i;
      break;
    }
  }

  code = lines.slice(startIdx).join("\n").trim();

  // Fix accidental # prefixes in color values
  code = code.replace(/#([0-9A-Fa-f]{6})\b/g, "$1");

  return code;
}
