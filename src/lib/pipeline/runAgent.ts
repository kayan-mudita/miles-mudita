import { query } from "@anthropic-ai/claude-agent-sdk";
import { CLAUDE_MODEL } from "./types";
import { pipelineLog, startTimer } from "./logger";

const AGENT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes per agent call

/**
 * Get the Anthropic API key, preferring MILES_ANTHROPIC_API_KEY
 * to avoid conflicts with Claude Code's own empty ANTHROPIC_API_KEY env var.
 */
export function getApiKey(): string {
  const key = process.env.MILES_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";
  return key;
}

interface RunAgentOptions {
  systemPrompt: string;
  userPrompt: string;
  tools?: string[];
  maxTurns?: number;
  outputSchema?: Record<string, unknown>;
  /** Label for logging (e.g. "planTopics", "researcher") */
  agentName?: string;
}

/**
 * Extract JSON from a string that may contain markdown code fences or prose around it.
 */
function extractJSON(text: string): string {
  // Try to extract from markdown code fences first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Try to find a JSON object or array in the text
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Return as-is and let JSON.parse handle the error
  return text.trim();
}

export async function runAgent<T>(options: RunAgentOptions): Promise<T> {
  const { systemPrompt, userPrompt, tools = [], maxTurns = 1, outputSchema, agentName } = options;
  const label = agentName || "unknown";
  const timer = startTimer();

  const apiKey = getApiKey();
  if (!apiKey) {
    pipelineLog.error(`[${label}] No Anthropic API key found`);
    throw new Error("No Anthropic API key found. Set MILES_ANTHROPIC_API_KEY in .env.local");
  }

  pipelineLog.debug(`[${label}] Agent call starting`, {
    data: {
      model: CLAUDE_MODEL,
      maxTurns,
      tools: tools.length > 0 ? tools : "none",
      hasSchema: !!outputSchema,
      promptPreview: userPrompt.slice(0, 120),
    },
  });

  // If we need JSON output, append explicit JSON instructions to the system prompt
  let finalSystemPrompt = systemPrompt;
  if (outputSchema) {
    const schemaStr = JSON.stringify(outputSchema, null, 2);
    finalSystemPrompt += `\n\nIMPORTANT: After completing your work, you MUST output your final answer as ONLY a valid JSON object matching this exact schema. No prose, no explanation, no markdown fences — just the raw JSON object.\n\nRequired output schema:\n${schemaStr}`;
  }

  const queryOptions: Record<string, unknown> = {
    model: CLAUDE_MODEL,
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    systemPrompt: finalSystemPrompt,
    maxTurns,
    env: {
      ANTHROPIC_API_KEY: apiKey,
      NODE_ENV: process.env.NODE_ENV || "development",
      // System paths needed for spawning node subprocess
      PATH: process.env.PATH || "",
      HOME: process.env.HOME || "",
    },
  };

  // Always pass tools — empty array disables all built-in Claude Code tools
  queryOptions.tools = tools;

  // Add timeout via AbortController to prevent hanging agent calls
  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, AGENT_TIMEOUT_MS);

  queryOptions.abortSignal = abortController.signal;

  const result = query({
    prompt: userPrompt,
    options: queryOptions as Parameters<typeof query>[0]["options"],
  });

  // Collect ALL text from assistant messages
  const allTextBlocks: string[] = [];
  let messageCount = 0;
  let toolUseCount = 0;

  try {
    for await (const message of result) {
      if (message.type === "assistant") {
        messageCount++;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const betaMessage = (message as any).message;
        const content = betaMessage?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block?.type === "text" && typeof block.text === "string" && block.text.trim()) {
              allTextBlocks.push(block.text);
            }
            if (block?.type === "tool_use") {
              toolUseCount++;
              pipelineLog.debug(`[${label}] Tool use: ${block.name || "unknown"}`, {
                data: { toolName: block.name },
              });
            }
          }
        }
      }
    }
  } catch (err) {
    if (abortController.signal.aborted) {
      pipelineLog.error(`[${label}] Agent timed out after ${AGENT_TIMEOUT_MS / 1000}s`, {
        durationMs: timer(),
        data: { messageCount, toolUseCount, textBlocks: allTextBlocks.length },
      });
      throw new Error(`Agent call timed out after ${AGENT_TIMEOUT_MS / 1000}s`);
    }
    pipelineLog.error(`[${label}] Agent stream error`, {
      durationMs: timer(),
      error: (err as Error).message,
      data: { messageCount, toolUseCount, textBlocks: allTextBlocks.length },
    });
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const elapsed = timer();

  pipelineLog.debug(`[${label}] Agent stream complete`, {
    durationMs: elapsed,
    data: {
      messageCount,
      toolUseCount,
      textBlocks: allTextBlocks.length,
      totalTextLength: allTextBlocks.reduce((sum, t) => sum + t.length, 0),
    },
  });

  // Use the LAST text block (which should contain the final response/JSON)
  const lastText = allTextBlocks.length > 0 ? allTextBlocks[allTextBlocks.length - 1] : "";

  if (!lastText) {
    // If no text blocks, try to construct from all collected text
    const allText = allTextBlocks.join("\n");
    if (allText) {
      if (outputSchema) {
        const jsonStr = extractJSON(allText);
        pipelineLog.debug(`[${label}] Parsed JSON from combined text blocks`, { durationMs: elapsed });
        return JSON.parse(jsonStr) as T;
      }
      return allText as unknown as T;
    }
    pipelineLog.error(`[${label}] Agent returned no text content`, {
      durationMs: elapsed,
      data: { messageCount, textBlocks: allTextBlocks.length, toolUseCount },
    });
    throw new Error("Agent returned no text content");
  }

  if (outputSchema) {
    const jsonStr = extractJSON(lastText);
    try {
      const parsed = JSON.parse(jsonStr) as T;
      pipelineLog.debug(`[${label}] JSON parsed successfully`, {
        durationMs: elapsed,
        data: { outputSize: jsonStr.length },
      });
      return parsed;
    } catch (e) {
      // If the last text block isn't valid JSON, try searching through ALL text blocks
      pipelineLog.warn(`[${label}] Last text block not valid JSON, searching all blocks...`, {
        data: { lastTextPreview: lastText.slice(0, 200), blockCount: allTextBlocks.length },
      });
      for (let i = allTextBlocks.length - 1; i >= 0; i--) {
        try {
          const candidate = extractJSON(allTextBlocks[i]);
          const parsed = JSON.parse(candidate) as T;
          pipelineLog.info(`[${label}] Found valid JSON in block ${i + 1}/${allTextBlocks.length}`, {
            durationMs: elapsed,
          });
          return parsed;
        } catch {
          continue;
        }
      }
      pipelineLog.error(`[${label}] Failed to parse JSON from any block`, {
        durationMs: elapsed,
        error: (e as Error).message,
        data: {
          lastTextPreview: lastText.slice(0, 300),
          allBlockSizes: allTextBlocks.map((b) => b.length),
        },
      });
      throw new Error(`Agent returned invalid JSON: ${(e as Error).message}`);
    }
  }

  return lastText as unknown as T;
}
