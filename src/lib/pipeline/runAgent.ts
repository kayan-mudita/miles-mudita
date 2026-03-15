import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "./types";
import { pipelineLog, startTimer } from "./logger";

const AGENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes per agent call

/**
 * Get the Anthropic API key, preferring MILES_ANTHROPIC_API_KEY
 * to avoid conflicts with Claude Code's own empty ANTHROPIC_API_KEY env var.
 */
export function getApiKey(): string {
  const key = process.env.MILES_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";
  return key;
}

/* ── Token-rate throttle ──────────────────────────────────────────────
 * Enforces a pipeline-wide tokens-per-minute cap (MILES_TPM_LIMIT env var,
 * default 20 000).  Uses a sliding-window token bucket: before each API
 * call we wait until enough budget is available, then after the call we
 * record actual usage from the Anthropic response.
 * ------------------------------------------------------------------- */

const DEFAULT_TPM = 20_000;

/** Timestamped record of tokens consumed by one API call. */
interface TokenRecord { ts: number; tokens: number }

/** Shared in-process ledger (fine for single-invocation serverless). */
const tokenLedger: TokenRecord[] = [];

function getTpmLimit(): number {
  const env = process.env.MILES_TPM_LIMIT;
  if (env) {
    const n = parseInt(env, 10);
    if (n > 0) return n;
  }
  return DEFAULT_TPM;
}

/** Tokens consumed in the last 60 s. */
function tokensInWindow(): number {
  const cutoff = Date.now() - 60_000;
  // Prune old entries while we're here
  while (tokenLedger.length > 0 && tokenLedger[0].ts < cutoff) {
    tokenLedger.shift();
  }
  return tokenLedger.reduce((sum, r) => sum + r.tokens, 0);
}

/** Block until we have room for at least `estimatedTokens` in the window. */
async function waitForBudget(estimatedTokens: number, label: string): Promise<void> {
  const limit = getTpmLimit();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const used = tokensInWindow();
    if (used + estimatedTokens <= limit) return;

    // How long until the oldest record falls out of the window?
    const oldest = tokenLedger[0];
    const waitMs = oldest ? (oldest.ts + 60_000) - Date.now() + 50 : 1_000;
    const clampedWait = Math.max(100, Math.min(waitMs, 30_000));
    pipelineLog.info(
      `[${label}] Token throttle: ${used}/${limit} TPM used, waiting ${(clampedWait / 1000).toFixed(1)}s`
    );
    await new Promise((r) => setTimeout(r, clampedWait));
  }
}

/** Record actual usage after a call completes. */
function recordUsage(tokens: number): void {
  tokenLedger.push({ ts: Date.now(), tokens });
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

/**
 * Run an agent using the Anthropic Messages API directly.
 * This replaces the previous claude-agent-sdk implementation that spawned
 * a Claude Code subprocess (which doesn't work on serverless platforms).
 */
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

  // Build API tools — map internal tool names to Anthropic API tool types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiTools: any[] = [];
  if (tools.includes("WebSearch")) {
    apiTools.push({ type: "web_search_20250305", name: "web_search", max_uses: 10 });
  }

  // Allow overriding base URL (e.g. OpenRouter: https://openrouter.ai/api/v1)
  // Falls back to Anthropic direct to bypass Netlify's AI proxy (which sets ANTHROPIC_BASE_URL)
  const baseURL = process.env.MILES_API_BASE_URL || "https://api.anthropic.com";
  const client = new Anthropic({ apiKey, baseURL });

  // Add timeout via AbortController
  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, AGENT_TIMEOUT_MS);

  const allTextBlocks: string[] = [];
  let toolUseCount = 0;

  try {
    // ── Throttle: wait for token budget ──────────────────
    // Rough estimate: prompt chars / 4 ≈ tokens.  Actual usage is recorded after.
    const estimatedInput = Math.ceil((finalSystemPrompt.length + userPrompt.length) / 4);
    await waitForBudget(estimatedInput, label);

    const createParams: Anthropic.MessageCreateParams = {
      model: CLAUDE_MODEL,
      max_tokens: 16384,
      system: finalSystemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    };

    if (apiTools.length > 0) {
      createParams.tools = apiTools;
    }

    const response = await client.messages.create(createParams, {
      signal: abortController.signal,
    });

    // ── Record actual token usage ────────────────────────
    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;
    const totalTokens = inputTokens + outputTokens;
    recordUsage(totalTokens);
    pipelineLog.debug(`[${label}] Tokens: ${inputTokens} in + ${outputTokens} out = ${totalTokens} total`);

    // Extract text blocks from response
    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) {
        allTextBlocks.push(block.text);
      }
      if (block.type === "tool_use" || block.type === "server_tool_use") {
        toolUseCount++;
        const toolName = "name" in block ? block.name : "unknown";
        pipelineLog.debug(`[${label}] Tool use: ${toolName}`, {
          data: { toolName },
        });
      }
    }
  } catch (err) {
    if (abortController.signal.aborted) {
      pipelineLog.error(`[${label}] Agent timed out after ${AGENT_TIMEOUT_MS / 1000}s`, {
        durationMs: timer(),
        data: { toolUseCount, textBlocks: allTextBlocks.length },
      });
      throw new Error(`Agent call timed out after ${AGENT_TIMEOUT_MS / 1000}s`);
    }
    pipelineLog.error(`[${label}] API call error`, {
      durationMs: timer(),
      error: (err as Error).message,
      data: { toolUseCount, textBlocks: allTextBlocks.length },
    });
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const elapsed = timer();

  pipelineLog.debug(`[${label}] API call complete`, {
    durationMs: elapsed,
    data: {
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
      data: { textBlocks: allTextBlocks.length, toolUseCount },
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
