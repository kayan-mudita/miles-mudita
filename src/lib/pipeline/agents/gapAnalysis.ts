import { runAgent } from "../runAgent";
import { gapAnalysisSchema } from "../schemas";
import { GapAnalysisOutput, ResearchContext, DimensionKey, DIMENSION_KEYS, DIMENSION_LABELS } from "../types";

const SYSTEM_PROMPT = `You are a research quality analyst. Review the research findings gathered so far for a specific dimension and identify gaps.

Look for:
- Missing data points (e.g., TAM numbers mentioned but not sourced)
- Under-explored sub-areas (e.g., regulatory landscape barely covered)
- Conflicting information that needs resolution
- Missing competitive examples or case studies
- Lack of quantitative evidence where it should exist
- Geographic or temporal blind spots
- Missing expert perspectives or industry analyses

Also consider cross-dimensional gaps — are there findings in other dimensions that should be explored further for this dimension?

Generate 4-6 specific follow-up search queries designed to fill these gaps.`;

export async function gapAnalysisAgent(
  ctx: ResearchContext,
  dim: DimensionKey
): Promise<GapAnalysisOutput> {
  const dimData = ctx.dimensions[dim];
  const label = DIMENSION_LABELS[dim];

  const crossDimContext = DIMENSION_KEYS.filter((k) => k !== dim)
    .map((k) => {
      const d = ctx.dimensions[k];
      const findings = d.allFindings?.substring(0, 500) || "Not yet researched";
      return `${DIMENSION_LABELS[k]}: ${findings}`;
    })
    .join("\n\n");

  const roundsSoFar = dimData.researchRounds
    .map(
      (r) =>
        `Round ${r.round}: ${r.queries.length} queries, ${r.sources.length} sources found\nFindings: ${r.findings.substring(0, 600)}`
    )
    .join("\n\n");

  const result = await runAgent<GapAnalysisOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Startup Idea: ${ctx.searchTopic}
Dimension: ${label}
Research Topic: ${dimData.topic}

Research Completed So Far:
${roundsSoFar}

Total Sources Found: ${dimData.allSources.length}
Combined Findings: ${dimData.allFindings.substring(0, 2000)}

Cross-Dimension Context:
${crossDimContext}

Identify gaps and generate 4-6 follow-up search queries.`,
    outputSchema: gapAnalysisSchema,
    maxTurns: 1,
    agentName: "gapAnalysis",
  });

  return result;
}
