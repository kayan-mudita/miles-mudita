import { runAgent } from "../runAgent";
import { subTopicPlannerSchema } from "../schemas";
import { SubTopicPlannerOutput, ResearchContext, DimensionKey, DIMENSION_LABELS } from "../types";

const SYSTEM_PROMPT = `You are a research planning specialist. Given a dimension topic and the overall startup idea, generate 8-10 specific, searchable research questions.

Each question should be:
- Specific enough to yield focused search results
- Designed to find quantitative data, named examples, or expert analysis
- Covering different angles of the dimension (not overlapping)
- Phrased as actual search queries that would work in a web search engine

Think like a top-tier analyst preparing for a comprehensive research report.`;

export async function subTopicPlannerAgent(
  ctx: ResearchContext,
  dim: DimensionKey
): Promise<void> {
  const dimData = ctx.dimensions[dim];
  const label = DIMENSION_LABELS[dim];

  const result = await runAgent<SubTopicPlannerOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Startup Idea: ${ctx.searchTopic}
Dimension: ${label}
Research Topic: ${dimData.topic}

Generate 8-10 specific, searchable research questions for this dimension.`,
    outputSchema: subTopicPlannerSchema,
    maxTurns: 1,
    agentName: "subTopicPlanner",
  });

  dimData.subQuestions = result.subQuestions;
}
