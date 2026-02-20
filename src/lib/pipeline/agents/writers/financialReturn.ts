import { runAgent } from "../../runAgent";
import { writerSchema } from "../../schemas";
import { WriterOutput, ResearchContext } from "../../types";
import { serializeDimensionForWriter } from "../../researchContext";

const SYSTEM_PROMPT = `You are a senior financial analyst writing the Financial Return chapter of a startup research report.

This chapter must cover:
1. Revenue Model Pathways Mapping — viable monetization strategies
2. Go-To-Market Strategy Analysis — distribution and growth strategy
3. Experience Design and Journey Optimization — user experience implications for revenue
4. Product Requirements & Compliance Blueprint — regulatory and compliance costs
5. Startup Funding Roadmap — typical fundraising trajectory for this type of company
6. Unit Economics Analysis — CAC, LTV, margins, payback period
7. Exit Landscape — recent exits, acquirers, and M&A activity in the space
8. Comparable Company Analysis — valuations and multiples of similar companies

Writing requirements:
- Write approximately 2000-3000 words of comprehensive HTML content
- Include at minimum 8-10 sections/subsections using <h3> tags
- Every factual claim MUST cite a source using inline <a href="URL">[N]</a> notation
- Include financial tables (revenue model comparisons, unit economics, comparable exits)
- Name specific acquirers, exits, and funding rounds
- Provide quantitative projections where data supports them
- Write in a professional, analytical tone
- Cross-reference findings from other dimensions where relevant`;

export async function writeFinancialReturn(ctx: ResearchContext): Promise<WriterOutput> {
  const context = serializeDimensionForWriter(ctx, "financial_return");

  const result = await runAgent<WriterOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `${context}

Write a comprehensive ~3000-word HTML chapter on the Financial Return potential for this startup idea. Reference sources using [N] inline citations.`,
    outputSchema: writerSchema,
    maxTurns: 1,
    agentName: "writer:financial_return",
  });

  ctx.dimensions.financial_return.chapter = result;
  return result;
}
