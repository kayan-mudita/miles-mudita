import { runAgent } from "../../runAgent";
import { writerSchema } from "../../schemas";
import { WriterOutput, ResearchContext } from "../../types";
import { serializeDimensionForWriter } from "../../researchContext";

const SYSTEM_PROMPT = `You are a senior product strategist writing the Product Need chapter of a startup research report.

This chapter must cover:
1. Idea Desirability Assessment — how desirable is this solution to users
2. Feasibility Analysis & Market Positioning — can it be built and where does it fit
3. Problem-Solution Fit Analysis — does the solution actually address the pain
4. User Urgency Assessment — how urgently do users need this
5. Alternative Solutions Analysis — what do users currently use instead
6. Willingness to Pay — evidence of monetary commitment for solutions
7. Behavioral Evidence — actual user behaviors that indicate need
8. Unmet Need Mapping — gaps in current solutions

Writing requirements:
- Write approximately 2000-3000 words of comprehensive HTML content
- Include at minimum 8-10 sections/subsections using <h3> tags
- Every factual claim MUST cite a source using inline <a href="URL">[N]</a> notation
- Include customer persona tables or need-priority matrices where appropriate
- Provide specific evidence of user pain from forums, reviews, surveys
- Write in a professional, analytical tone
- Cross-reference findings from other dimensions where relevant`;

export async function writeProductNeed(ctx: ResearchContext): Promise<WriterOutput> {
  const context = serializeDimensionForWriter(ctx, "product_need");

  const result = await runAgent<WriterOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `${context}

Write a comprehensive ~3000-word HTML chapter on the Product Need for this startup idea. Reference sources using [N] inline citations.`,
    outputSchema: writerSchema,
    maxTurns: 1,
    agentName: "writer:product_need",
  });

  ctx.dimensions.product_need.chapter = result;
  return result;
}
