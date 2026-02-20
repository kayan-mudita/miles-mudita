import { runAgent } from "../runAgent";
import { deepDiveSchema } from "../schemas";
import { DeepDiveOutput, ResearchContext, DimensionKey, DIMENSION_LABELS } from "../types";

const SYSTEM_PROMPT = `You are a data-focused research specialist. Based on the research gathered so far, generate 3-5 highly specific queries designed to find:

- Exact statistics and numbers (market sizes, growth rates, revenue figures)
- Named case studies of companies in this space
- Expert quotes or analyst opinions from named individuals
- Regulatory specifics (named laws, compliance requirements)
- Financial data (funding rounds, valuations, unit economics benchmarks)
- Technical specifications or benchmarks

These queries should be very specific — like what a senior analyst would Google to find the exact data point they need for a report.`;

export async function deepDiveAgent(
  ctx: ResearchContext,
  dim: DimensionKey
): Promise<DeepDiveOutput> {
  const dimData = ctx.dimensions[dim];
  const label = DIMENSION_LABELS[dim];

  const result = await runAgent<DeepDiveOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Startup Idea: ${ctx.searchTopic}
Dimension: ${label}

Research findings so far:
${dimData.allFindings.substring(0, 3000)}

Sources collected: ${dimData.allSources.length}

Generate 3-5 highly specific queries to find exact data points, case studies, and expert analysis.`,
    outputSchema: deepDiveSchema,
    maxTurns: 1,
    agentName: "deepDive",
  });

  return result;
}
