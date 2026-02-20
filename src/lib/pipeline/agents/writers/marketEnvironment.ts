import { runAgent } from "../../runAgent";
import { writerSchema } from "../../schemas";
import { WriterOutput, ResearchContext } from "../../types";
import { serializeDimensionForWriter } from "../../researchContext";

const SYSTEM_PROMPT = `You are a senior market analyst writing the Market Environment chapter of a startup research report.

This chapter must cover:
1. Market Pain Points Analysis — what problems exist in this market
2. Trend Identification — macro trends shaping the opportunity
3. Market Segmentation — key customer segments and their needs
4. Market Maturity & Growth — lifecycle stage and growth trajectory
5. TAM Assessment — total addressable market sizing with methodology
6. Industry Parallels — lessons from analogous markets/industries

Writing requirements:
- Write approximately 2000-3000 words of comprehensive HTML content
- Include at minimum 8-10 sections/subsections using <h3> tags
- Every factual claim MUST cite a source using inline <a href="URL">[N]</a> notation
- Include data tables using <table> tags where appropriate (e.g., TAM breakdown, market segments)
- Use <ul>/<ol> for structured comparisons
- Write in a professional, analytical tone — like a top-tier consulting report
- Include specific numbers, percentages, and named examples wherever possible
- Cross-reference findings from other dimensions where relevant`;

export async function writeMarketEnvironment(ctx: ResearchContext): Promise<WriterOutput> {
  const context = serializeDimensionForWriter(ctx, "market_environment");

  const result = await runAgent<WriterOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `${context}

Write a comprehensive ~3000-word HTML chapter on the Market Environment for this startup idea. Reference sources using [N] inline citations.`,
    outputSchema: writerSchema,
    maxTurns: 1,
    agentName: "writer:market_environment",
  });

  ctx.dimensions.market_environment.chapter = result;
  return result;
}
