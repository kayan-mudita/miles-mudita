import { runAgent } from "../runAgent";
import { scoringSummarySchema } from "../schemas";
import { ScoringSummaryOutput, ResearchContext, DIMENSION_KEYS, DIMENSION_LABELS } from "../types";
import { serializeAllScoresForSummary } from "../researchContext";

const SYSTEM_PROMPT = `You are a senior investment analyst creating a scoring summary for a startup research report.

Based on all 5 dimension scores, you must:

1. Calculate an overall weighted score (1-10):
   - Market Environment: 20% weight
   - Competition: 20% weight
   - Cost & Difficulty: 20% weight
   - Product Need: 25% weight
   - Financial Return: 15% weight

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

4. Create a scoring table (HTML) with all dimensions, their scores, and brief justifications.

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
