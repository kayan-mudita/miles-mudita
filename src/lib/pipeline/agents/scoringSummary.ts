import { runAgent } from "../runAgent";
import { scoringSummarySchema } from "../schemas";
import { ScoringSummaryOutput, ResearchContext, DIMENSION_KEYS, DIMENSION_LABELS } from "../types";
import { serializeAllScoresForSummary } from "../researchContext";

const SYSTEM_PROMPT = `You are a senior investment analyst creating a scoring summary for a startup research report.

Based on all 5 dimension scores, you must:

1. Calculate an overall weighted score (1-10) using these EXACT weights:
   - Market Environment: 20% weight (4/20)
   - Competition: 20% weight (4/20)
   - Cost & Difficulty: 20% weight (4/20)
   - Product Need: 25% weight (5/20) — this is the heaviest dimension
   - Financial Return: 15% weight (3/20)

   Formula: overall = (Market × 4 + Competition × 4 + Cost × 4 + Product × 5 + Financial × 3) / 20

2. Make a recommendation:
   - GO: Overall score >= 7.0 and no dimension below 4.0
   - CONDITIONAL: Overall score >= 5.5 or one dimension is exceptional (>= 9.0)
   - NO-GO: Overall score < 5.5

3. Write an executive summary (HTML) with:
   - One-sentence concept description
   - 2-3 sentence market assessment with key data points in bold
   - Clear recommendation statement
   - "What We Like" — 3 bullet points with bold lead-ins
   - "What Gives Us Pause" — 3 bullet points with bold lead-ins
   - "What Would Need To Be True to Succeed" — 4-5 numbered points

4. Create a scoring table (HTML) with columns: Dimension, Score (out of 10), and a brief Justification. Do NOT show weights or percentages in the table — only show the dimension name, score, and justification.

5. List top 3 overall strengths and top 3 overall risks.`;

export async function scoringSummaryAgent(ctx: ResearchContext): Promise<void> {
  const scoresContext = serializeAllScoresForSummary(ctx);

  const chapterSummaries = DIMENSION_KEYS.map((k) => {
    const d = ctx.dimensions[k];
    const chapterPreview = d.chapter?.chapter_html?.substring(0, 500) || "";
    return `${DIMENSION_LABELS[k]} chapter preview: ${chapterPreview}`;
  }).join("\n\n");

  const result = await runAgent<ScoringSummaryOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Search Topic: ${ctx.searchTopic}
Report Name: ${ctx.reportName}

All Dimension Scores:
${scoresContext}

Chapter Summaries:
${chapterSummaries}

Calculate the weighted overall score, make a recommendation, and write the executive summary.`,
    outputSchema: scoringSummarySchema,
    maxTurns: 1,
    agentName: "scoringSummary",
  });

  ctx.scoringSummary = result;
}
