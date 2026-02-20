import { ResearchContext, DimensionKey, DIMENSION_LABELS, ResearchRound } from "../types";
import { deduplicateSources } from "../sourceManager";
import { subTopicPlannerAgent } from "./subTopicPlanner";
import { researcherAgent } from "./researcher";
import { gapAnalysisAgent } from "./gapAnalysis";
import { deepDiveAgent } from "./deepDive";
import { pipelineLog, startTimer } from "../logger";

const MIN_SOURCES_TARGET = 30;
const DEFAULT_MAX_ROUNDS = 3;
const MAX_CONCURRENT_QUERIES = 4;

/**
 * Process queries in controlled batches to avoid overwhelming the API
 */
async function batchResearch(
  queries: string[],
  batchSize: number = MAX_CONCURRENT_QUERIES
): Promise<{ sources: { url: string; title: string; content: string }[]; synthesis: string }[]> {
  const results: { sources: { url: string; title: string; content: string }[]; synthesis: string }[] = [];

  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((q) =>
        researcherAgent(q).catch((err) => {
          pipelineLog.error(`Research failed for query "${q}"`, {
            error: (err as Error).message || String(err),
            data: { query: q.slice(0, 120) },
          });
          return { sources: [], synthesis: "" };
        })
      )
    );
    for (let j = 0; j < batch.length; j++) {
      pipelineLog.debug("Batch research query result", {
        data: { query: batch[j].slice(0, 120), sourceCount: batchResults[j].sources.length },
      });
    }
    results.push(...batchResults);

    // Brief pause between batches (SDK handles rate limiting internally)
    if (i + batchSize < queries.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

export async function deepResearchLoop(
  ctx: ResearchContext,
  dim: DimensionKey,
  onProgress?: (round: number, detail: string) => void | Promise<void>,
  maxRounds?: number
): Promise<void> {
  const effectiveMaxRounds = maxRounds ?? DEFAULT_MAX_ROUNDS;
  const dimData = ctx.dimensions[dim];
  const label = DIMENSION_LABELS[dim];

  // Step 1: Generate sub-questions — if planning fails, re-throw immediately
  onProgress?.(0, `${label}: Planning sub-topics...`);
  await subTopicPlannerAgent(ctx, dim);

  // Limit initial queries to reduce concurrency
  const initialQueries = dimData.subQuestions.slice(0, 6);

  // Track which rounds succeeded vs failed
  const failedRounds: number[] = [];
  let roundsAttempted = 0;

  // Round 1: Search sub-questions in controlled batches
  try {
    roundsAttempted++;
    const round1Timer = startTimer();
    pipelineLog.info("Research round starting", {
      dimension: dim,
      data: { round: 1, queryCount: initialQueries.length },
    });
    onProgress?.(1, `${label}: Research round 1 (${initialQueries.length} queries)...`);
    const round1Results = await batchResearch(initialQueries);

    const round1: ResearchRound = {
      round: 1,
      queries: initialQueries,
      sources: round1Results.flatMap((r) => r.sources),
      findings: round1Results.map((r) => r.synthesis).filter(Boolean).join("\n\n"),
      gaps: [],
    };
    dimData.researchRounds.push(round1);
    dimData.allSources = deduplicateSources(round1.sources);
    dimData.allFindings = round1.findings;

    pipelineLog.info("Research round complete", {
      dimension: dim,
      durationMs: round1Timer(),
      data: { round: 1, sourcesFound: dimData.allSources.length },
    });
    onProgress?.(1, `${label}: Round 1 complete (${dimData.allSources.length} sources)`);
  } catch (err) {
    pipelineLog.warn(`Research round 1 failed for ${label}`, {
      dimension: dim,
      error: (err as Error).message || String(err),
    });
    failedRounds.push(1);
  }

  // Round 2: Gap analysis + follow-up
  if (effectiveMaxRounds >= 2 && dimData.allSources.length > 0 && dimData.allSources.length < MIN_SOURCES_TARGET) {
    try {
      roundsAttempted++;
      const round2Timer = startTimer();
      pipelineLog.info("Research round starting", {
        dimension: dim,
        data: { round: 2, queryCount: "gap analysis" },
      });
      onProgress?.(2, `${label}: Research round 2 (gap analysis)...`);

      let gaps;
      try {
        gaps = await gapAnalysisAgent(ctx, dim);
      } catch (err) {
        pipelineLog.warn(`Gap analysis failed for ${label}`, {
          dimension: dim,
          error: (err as Error).message || String(err),
        });
        gaps = { gaps: [], followUpQuestions: [] };
      }

      if (gaps.followUpQuestions.length > 0) {
        const followUpQueries = gaps.followUpQuestions.slice(0, 4);
        const round2Results = await batchResearch(followUpQueries);

        const round2: ResearchRound = {
          round: 2,
          queries: followUpQueries,
          sources: round2Results.flatMap((r) => r.sources),
          findings: round2Results.map((r) => r.synthesis).filter(Boolean).join("\n\n"),
          gaps: gaps.gaps,
        };
        dimData.researchRounds.push(round2);
        dimData.allSources = deduplicateSources([...dimData.allSources, ...round2.sources]);
        dimData.allFindings += "\n\n" + round2.findings;
      }

      pipelineLog.info("Research round complete", {
        dimension: dim,
        durationMs: round2Timer(),
        data: { round: 2, sourcesFound: dimData.allSources.length },
      });
      onProgress?.(2, `${label}: Round 2 complete (${dimData.allSources.length} sources)`);
    } catch (err) {
      pipelineLog.warn(`Research round 2 failed for ${label}`, {
        dimension: dim,
        error: (err as Error).message || String(err),
      });
      failedRounds.push(2);
    }
  }

  // Round 3: Deep dive on specific data points
  if (effectiveMaxRounds >= 3 && dimData.allSources.length < MIN_SOURCES_TARGET) {
    try {
      roundsAttempted++;
      const round3Timer = startTimer();
      pipelineLog.info("Research round starting", {
        dimension: dim,
        data: { round: 3, queryCount: "deep dive" },
      });
      onProgress?.(3, `${label}: Research round 3 (deep dive)...`);

      let deepDive;
      try {
        deepDive = await deepDiveAgent(ctx, dim);
      } catch (err) {
        pipelineLog.warn(`Deep dive failed for ${label}`, {
          dimension: dim,
          error: (err as Error).message || String(err),
        });
        deepDive = { queries: [] };
      }

      if (deepDive.queries.length > 0) {
        const deepQueries = deepDive.queries.slice(0, 3);
        const round3Results = await batchResearch(deepQueries);

        const round3: ResearchRound = {
          round: 3,
          queries: deepQueries,
          sources: round3Results.flatMap((r) => r.sources),
          findings: round3Results.map((r) => r.synthesis).filter(Boolean).join("\n\n"),
          gaps: [],
        };
        dimData.researchRounds.push(round3);
        dimData.allSources = deduplicateSources([...dimData.allSources, ...round3.sources]);
        dimData.allFindings += "\n\n" + round3.findings;
      }

      pipelineLog.info("Research round complete", {
        dimension: dim,
        durationMs: round3Timer(),
        data: { round: 3, sourcesFound: dimData.allSources.length },
      });
    } catch (err) {
      pipelineLog.warn(`Research round 3 failed for ${label}`, {
        dimension: dim,
        error: (err as Error).message || String(err),
      });
      failedRounds.push(3);
    }
  }

  // If ALL attempted rounds failed, throw instead of returning empty results
  if (roundsAttempted > 0 && failedRounds.length === roundsAttempted) {
    throw new Error(
      `All ${roundsAttempted} research round(s) failed for ${label} (rounds: ${failedRounds.join(", ")})`
    );
  }

  if (failedRounds.length > 0) {
    pipelineLog.warn(`${label}: ${failedRounds.length}/${roundsAttempted} research rounds failed`, {
      dimension: dim,
      data: { failedRounds, roundsAttempted },
    });
  }

  pipelineLog.info("Research complete", {
    dimension: dim,
    data: {
      totalSources: dimData.allSources.length,
      totalFindings: dimData.allFindings.length,
      roundsCompleted: dimData.researchRounds.length,
      roundsAttempted,
      failedRounds,
    },
  });

  await onProgress?.(effectiveMaxRounds + 1, `${label}: Research complete (${dimData.allSources.length} sources)`);
}
