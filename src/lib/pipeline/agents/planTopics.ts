import { runAgent } from "../runAgent";
import { planTopicsSchema } from "../schemas";
import { PlanTopicsOutput, ResearchContext } from "../types";
import { pipelineLog } from "../logger";

const SYSTEM_PROMPT = `You are a senior research strategist. Given a startup idea, generate exactly 5 focused research topics — one for each of these dimensions:

1. Market Environment — TAM, market growth, regulatory landscape, macro trends
2. Competition — Competitive landscape, incumbents, funded startups, moats, white space
3. Cost & Difficulty — Technical complexity, capital requirements, team needed, GTM difficulty
4. Product Need — Problem urgency, existing alternatives, willingness to pay, user pain
5. Financial Return — Revenue models, unit economics, margin potential, exit likelihood

Each topic should be a specific, actionable research directive (2-3 sentences) tailored to the startup idea. Make them concrete enough that a researcher could immediately start searching.`;

export async function planTopicsAgent(ctx: ResearchContext): Promise<void> {
  const result = await runAgent<PlanTopicsOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Startup Idea: ${ctx.searchTopic}\nReport Name: ${ctx.reportName}\n\nGenerate 5 focused research topics, one per dimension.`,
    outputSchema: planTopicsSchema,
    maxTurns: 1,
    agentName: "planTopics",
  });

  pipelineLog.info("Topics generated for each dimension", {
    data: {
      market_environment: result.topic_1?.substring(0, 80),
      competition: result.topic_2?.substring(0, 80),
      cost_difficulty: result.topic_3?.substring(0, 80),
      product_need: result.topic_4?.substring(0, 80),
      financial_return: result.topic_5?.substring(0, 80),
    },
    agent: "planTopics",
  });

  ctx.topics = result;

  // Assign topics to dimensions
  ctx.dimensions.market_environment.topic = result.topic_1;
  ctx.dimensions.competition.topic = result.topic_2;
  ctx.dimensions.cost_difficulty.topic = result.topic_3;
  ctx.dimensions.product_need.topic = result.topic_4;
  ctx.dimensions.financial_return.topic = result.topic_5;
}
