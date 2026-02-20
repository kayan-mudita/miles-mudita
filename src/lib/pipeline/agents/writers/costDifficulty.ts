import { runAgent } from "../../runAgent";
import { writerSchema } from "../../schemas";
import { WriterOutput, ResearchContext } from "../../types";
import { serializeDimensionForWriter } from "../../researchContext";

const SYSTEM_PROMPT = `You are a senior technology and operations analyst writing the Cost & Difficulty chapter of a startup research report.

This chapter must cover:
1. Technology Replication Risk Assessment — how easily the tech can be copied
2. Hypothesis Testing for Business Growth — key assumptions and how to validate
3. "How Might We" Statement Creation — design thinking framing
4. Customer Interview Script Creation — key questions to validate
5. Journey-Based Interview Question Generation
6. Customer Feedback to Journey Map — mapping pain points to user journey
7. Future Technologies & Innovation Mapping — emerging tech that could help/disrupt
8. Strategic IP Opportunity Mapping — what IP could be built

Writing requirements:
- Write approximately 2000-3000 words of comprehensive HTML content
- Include at minimum 8-10 sections/subsections using <h3> tags
- Every factual claim MUST cite a source using inline <a href="URL">[N]</a> notation
- Include cost estimation tables where appropriate
- Analyze technical complexity and team requirements
- Discuss go-to-market difficulty and strategies
- Write in a professional, analytical tone
- Cross-reference findings from other dimensions where relevant`;

export async function writeCostDifficulty(ctx: ResearchContext): Promise<WriterOutput> {
  const context = serializeDimensionForWriter(ctx, "cost_difficulty");

  const result = await runAgent<WriterOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `${context}

Write a comprehensive ~3000-word HTML chapter on Cost & Difficulty for this startup idea. Reference sources using [N] inline citations.`,
    outputSchema: writerSchema,
    maxTurns: 1,
    agentName: "writer:cost_difficulty",
  });

  ctx.dimensions.cost_difficulty.chapter = result;
  return result;
}
