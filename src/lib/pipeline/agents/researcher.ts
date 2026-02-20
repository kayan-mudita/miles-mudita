import { runAgent } from "../runAgent";
import { researcherSchema } from "../schemas";
import { ResearcherOutput } from "../types";
import { pipelineLog, startTimer } from "../logger";

const SYSTEM_PROMPT = `You are a research analyst. For the given search query:

1. Use WebSearch ONCE to find relevant results
2. From the search results, extract 3-5 sources with URLs, titles, and key findings
3. Write a brief synthesis of what you found
4. Output the result as JSON

CRITICAL RULES:
- Do ONE WebSearch call only — do not use WebFetch
- Your SECOND message (after getting search results) must be ONLY the JSON output
- No additional searches or fetches
- No prose or explanation — just the JSON

Every source MUST have a valid URL. Summarize each source's key content in 1-2 sentences.`;

export async function researcherAgent(searchQuery: string): Promise<ResearcherOutput> {
  const timer = startTimer();
  try {
    const result = await runAgent<ResearcherOutput>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Search for: "${searchQuery}"

Do ONE WebSearch, then output ONLY the JSON with sources and synthesis. Nothing else.`,
      tools: ["WebSearch"],
      maxTurns: 4,
      outputSchema: researcherSchema,
      agentName: "researcher",
    });

    pipelineLog.info("Research query complete", {
      durationMs: timer(),
      agent: "researcher",
      data: { query: searchQuery.slice(0, 120), sourceCount: result.sources.length },
    });

    return result;
  } catch (err) {
    pipelineLog.error(`Researcher agent failed for "${searchQuery}"`, {
      durationMs: timer(),
      agent: "researcher",
      error: (err as Error).message,
      data: { query: searchQuery.slice(0, 120) },
    });
    return { sources: [], synthesis: "" };
  }
}
