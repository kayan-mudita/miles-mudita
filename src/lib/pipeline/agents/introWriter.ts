import { runAgent } from "../runAgent";
import { introSchema } from "../schemas";
import { IntroOutput, ResearchContext, DIMENSION_LABELS, DIMENSION_KEYS } from "../types";
import { pipelineLog } from "../logger";

const SYSTEM_PROMPT = `You are a professional research report writer. Given a startup idea and 5 research dimension topics, generate:

1. A compelling, concise report title
2. An introduction paragraph (HTML formatted, 2-3 sentences) that frames the analysis
3. Chapter headings for each of the 5 dimensions that are specific to this startup idea

The introduction should establish what the startup concept is, why it's being analyzed, and set expectations for the report structure. Make headings descriptive and specific to this idea, not generic.`;

export async function introWriterAgent(ctx: ResearchContext): Promise<void> {
  const topicsList = DIMENSION_KEYS.map((k, i) => {
    return `${i + 1}. ${DIMENSION_LABELS[k]}: ${ctx.dimensions[k].topic}`;
  }).join("\n");

  const result = await runAgent<IntroOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Startup Idea: ${ctx.searchTopic}
Report Name: ${ctx.reportName}

Research Dimensions and Topics:
${topicsList}

Generate a report title, introduction paragraph (HTML), and 5 chapter headings.`,
    outputSchema: introSchema,
    maxTurns: 1,
    agentName: "introWriter",
  });

  pipelineLog.info("Title generated", {
    data: { title: result.title },
    agent: "introWriter",
  });

  ctx.intro = result;
}
