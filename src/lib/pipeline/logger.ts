import { appendFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// ─── Log Levels ─────────────────────────────────────────────
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

// ─── Configuration ──────────────────────────────────────────
const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "pipeline.log");
const MIN_LEVEL: LogLevel = (process.env.PIPELINE_LOG_LEVEL as LogLevel) || "DEBUG";

// Ensure logs directory exists
try {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
} catch {
  // If we can't create log dir, we'll still log to console
}

// ─── Formatting ─────────────────────────────────────────────
function timestamp(): string {
  return new Date().toISOString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

interface LogEntry {
  ts: string;
  level: LogLevel;
  jobId?: string;
  stage?: string;
  agent?: string;
  dimension?: string;
  msg: string;
  data?: Record<string, unknown>;
  durationMs?: number;
  error?: string;
  stack?: string;
}

function write(entry: LogEntry) {
  if (LEVEL_PRIORITY[entry.level] < LEVEL_PRIORITY[MIN_LEVEL]) return;

  // Structured JSON line for file
  const jsonLine = JSON.stringify(entry);

  // Human-readable line for console
  const parts = [
    `[${entry.ts}]`,
    `[${entry.level.padEnd(5)}]`,
  ];
  if (entry.jobId) parts.push(`[job:${entry.jobId.slice(-8)}]`);
  if (entry.stage) parts.push(`[${entry.stage}]`);
  if (entry.agent) parts.push(`[${entry.agent}]`);
  if (entry.dimension) parts.push(`[${entry.dimension}]`);
  parts.push(entry.msg);
  if (entry.durationMs !== undefined) parts.push(`(${formatDuration(entry.durationMs)})`);
  if (entry.data) parts.push(JSON.stringify(entry.data));
  if (entry.error) parts.push(`ERR: ${entry.error}`);

  const consoleLine = parts.join(" ");

  // Write to console
  if (entry.level === "ERROR" || entry.level === "FATAL") {
    console.error(consoleLine);
  } else if (entry.level === "WARN") {
    console.warn(consoleLine);
  } else {
    console.log(consoleLine);
  }

  // Write to file
  try {
    appendFileSync(LOG_FILE, jsonLine + "\n");
  } catch {
    // Silently fail file writes — console is the fallback
  }
}

// ─── Pipeline Logger ────────────────────────────────────────
// Creates a scoped logger for a specific pipeline job
export function createPipelineLogger(jobId: string) {
  function log(level: LogLevel, msg: string, extra?: Partial<Omit<LogEntry, "ts" | "level" | "jobId" | "msg">>) {
    write({ ts: timestamp(), level, jobId, msg, ...extra });
  }

  return {
    // Basic levels
    debug: (msg: string, extra?: Partial<LogEntry>) => log("DEBUG", msg, extra),
    info: (msg: string, extra?: Partial<LogEntry>) => log("INFO", msg, extra),
    warn: (msg: string, extra?: Partial<LogEntry>) => log("WARN", msg, extra),
    error: (msg: string, extra?: Partial<LogEntry>) => log("ERROR", msg, extra),
    fatal: (msg: string, extra?: Partial<LogEntry>) => log("FATAL", msg, extra),

    // ─── Pipeline lifecycle ───────────────────────────────
    pipelineStart: (searchTopic: string, reportName: string, maxRounds: number) => {
      log("INFO", "━━━ PIPELINE START ━━━", {
        data: { searchTopic, reportName, maxRounds },
      });
    },

    pipelineEnd: (durationMs: number, totalSources: number, overallScore: number | null) => {
      log("INFO", "━━━ PIPELINE COMPLETE ━━━", {
        durationMs,
        data: { totalSources, overallScore },
      });
    },

    pipelineFail: (err: unknown, durationMs: number) => {
      const error = err instanceof Error ? err : new Error(String(err));
      log("FATAL", "━━━ PIPELINE FAILED ━━━", {
        durationMs,
        error: error.message,
        stack: error.stack,
      });
    },

    // ─── Stage transitions ────────────────────────────────
    stageStart: (stage: string, detail?: string) => {
      log("INFO", `▶ Stage: ${stage}${detail ? ` — ${detail}` : ""}`, { stage });
    },

    stageEnd: (stage: string, durationMs: number, detail?: string) => {
      log("INFO", `✓ Stage complete: ${stage}${detail ? ` — ${detail}` : ""}`, { stage, durationMs });
    },

    // ─── Agent calls ──────────────────────────────────────
    agentStart: (agent: string, dimension?: string) => {
      log("DEBUG", `→ Agent call: ${agent}`, { agent, dimension });
    },

    agentEnd: (agent: string, durationMs: number, result?: { outputSize?: number; dimension?: string }) => {
      log("INFO", `← Agent done: ${agent}`, {
        agent,
        durationMs,
        dimension: result?.dimension,
        data: result?.outputSize ? { outputSize: result.outputSize } : undefined,
      });
    },

    agentFail: (agent: string, err: unknown, durationMs: number, dimension?: string) => {
      const error = err instanceof Error ? err : new Error(String(err));
      log("ERROR", `✗ Agent failed: ${agent}`, {
        agent,
        dimension,
        durationMs,
        error: error.message,
        stack: error.stack,
      });
    },

    // ─── Research tracking ────────────────────────────────
    researchRound: (dimension: string, round: number, queryCount: number) => {
      log("INFO", `Research round ${round} starting — ${queryCount} queries`, { dimension, data: { round, queryCount } });
    },

    researchQuery: (dimension: string, round: number, query: string, sourceCount: number, durationMs: number) => {
      log("DEBUG", `Query: "${query.slice(0, 80)}" → ${sourceCount} sources`, {
        dimension,
        durationMs,
        data: { round, sourceCount, queryPreview: query.slice(0, 120) },
      });
    },

    researchRoundEnd: (dimension: string, round: number, totalSources: number, durationMs: number) => {
      log("INFO", `Research round ${round} done — ${totalSources} total sources`, {
        dimension,
        durationMs,
        data: { round, totalSources },
      });
    },

    researchComplete: (dimension: string, totalSources: number, totalFindings: number, rounds: number, durationMs: number) => {
      log("INFO", `Research complete for ${dimension} — ${totalSources} sources, ${totalFindings} findings, ${rounds} rounds`, {
        dimension,
        durationMs,
        data: { totalSources, totalFindings, rounds },
      });
    },

    // ─── Writing tracking ─────────────────────────────────
    chapterWritten: (dimension: string, htmlLength: number, sourcesUsed: number, durationMs: number) => {
      log("INFO", `Chapter written: ${dimension} — ${htmlLength} chars, ${sourcesUsed} sources cited`, {
        dimension,
        durationMs,
        data: { htmlLength, sourcesUsed },
      });
    },

    // ─── Scoring tracking ─────────────────────────────────
    dimensionScored: (dimension: string, score: number, durationMs: number) => {
      log("INFO", `Scored: ${dimension} = ${score}/10`, {
        dimension,
        durationMs,
        data: { score },
      });
    },

    summaryScored: (overallScore: number, recommendation: string, durationMs: number) => {
      log("INFO", `Overall: ${overallScore}/10 — ${recommendation}`, {
        durationMs,
        data: { overallScore, recommendation },
      });
    },

    // ─── Assembly ─────────────────────────────────────────
    reportAssembled: (htmlLength: number, sourceCount: number, durationMs: number) => {
      log("INFO", `Report assembled — ${htmlLength} chars, ${sourceCount} sources`, {
        durationMs,
        data: { htmlLength, sourceCount },
      });
    },

    // ─── DB operations ────────────────────────────────────
    dbWrite: (operation: string, durationMs: number) => {
      log("DEBUG", `DB: ${operation}`, { durationMs });
    },

    // ─── Generic data logging ─────────────────────────────
    data: (msg: string, data: Record<string, unknown>) => {
      log("DEBUG", msg, { data });
    },
  };
}

// ─── Standalone logger (no job context) ─────────────────────
export const pipelineLog = {
  debug: (msg: string, extra?: Partial<LogEntry>) => write({ ts: timestamp(), level: "DEBUG", msg, ...extra }),
  info: (msg: string, extra?: Partial<LogEntry>) => write({ ts: timestamp(), level: "INFO", msg, ...extra }),
  warn: (msg: string, extra?: Partial<LogEntry>) => write({ ts: timestamp(), level: "WARN", msg, ...extra }),
  error: (msg: string, extra?: Partial<LogEntry>) => write({ ts: timestamp(), level: "ERROR", msg, ...extra }),
};

// ─── Timer utility ──────────────────────────────────────────
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}

// ─── Log file path (for reading from CLI) ───────────────────
export const PIPELINE_LOG_FILE = LOG_FILE;
