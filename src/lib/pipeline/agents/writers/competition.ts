import { runAgent } from "../../runAgent";
import { writerSchema } from "../../schemas";
import { WriterOutput, ResearchContext } from "../../types";
import { serializeDimensionForWriter } from "../../researchContext";

const SYSTEM_PROMPT = `You are a senior competitive intelligence analyst writing the Competition chapter of a startup research report.

This chapter must cover:
1. Customer Insights & Market Opportunity Mapping
2. Customer Voice Mapping — what customers say about existing solutions
3. Persona Research and Validation
4. Customer Segmentation and Strategic Profiling
5. Porter's 5 Forces Market Analysis
6. Pain Point Solution Landscape — how the market currently addresses pain
7. Startup Sourcing & Profiling — funded startups in the space
8. Competitive Technology Identification
9. Competitor Analysis and Insights — detailed competitor breakdowns

Writing requirements:
- Write approximately 2000-3000 words of comprehensive HTML content
- Include at minimum 8-10 sections/subsections using <h3> tags
- Every factual claim MUST cite a source using inline <a href="URL">[N]</a> notation
- Include competitor comparison tables using <table> tags
- Name specific companies, their funding, founding dates, and key differentiators
- Analyze the competitive moat landscape
- Write in a professional, analytical tone
- Cross-reference market data from other dimensions where relevant`;

export async function writeCompetition(ctx: ResearchContext): Promise<WriterOutput> {
  const context = serializeDimensionForWriter(ctx, "competition");

  const result = await runAgent<WriterOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `${context}

Write a comprehensive ~3000-word HTML chapter on the Competition landscape for this startup idea. Reference sources using [N] inline citations.`,
    outputSchema: writerSchema,
    maxTurns: 1,
    agentName: "writer:competition",
  });

  ctx.dimensions.competition.chapter = result;
  return result;
}
