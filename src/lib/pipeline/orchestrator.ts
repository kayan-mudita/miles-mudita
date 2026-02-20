import { DIMENSION_KEYS, DIMENSION_LABELS, DimensionKey } from "./types";
import { createResearchContext } from "./researchContext";
import { buildGlobalSourceIndex } from "./sourceManager";
import { updateJob } from "./jobStore";
import { planTopicsAgent } from "./agents/planTopics";
import { introWriterAgent } from "./agents/introWriter";
import { deepResearchLoop } from "./agents/researchLoop";
import { writeChapter } from "./agents/writers";
import { scorerAgent } from "./agents/scorers";
import { scoringSummaryAgent } from "./agents/scoringSummary";
import { assembleReport } from "./assembler";
import { createPipelineLogger, startTimer } from "./logger";

/**
 * Run async tasks in batches of given concurrency
 */
async function batchProcess<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map((item, batchIdx) => fn(item, i + batchIdx)));
  }
}

export async function runPipeline(
  jobId: string,
  searchTopic: string,
  reportName: string,
  maxRounds?: number
): Promise<void> {
  const log = createPipelineLogger(jobId);
  const pipelineTimer = startTimer();
  const effectiveMaxRounds = maxRounds ?? 3;

  log.pipelineStart(searchTopic, reportName, effectiveMaxRounds);

  const ctx = createResearchContext(searchTopic, reportName);

  try {
    // ─── Step 1: Plan topics ────────────────────────────
    log.stageStart("planning", "Generating research dimensions...");
    const planTimer = startTimer();
    await updateJob(jobId, { stage: "planning", progress: 5, detail: "Generating research dimensions..." });
    await planTopicsAgent(ctx);
    log.stageEnd("planning", planTimer(), `Topics: ${Object.values(ctx.dimensions).map(d => d.topic?.slice(0, 40)).join(" | ")}`);
    await updateJob(jobId, { progress: 8, detail: "Research dimensions planned" });

    // ─── Steps 2+3: Intro writer + Deep research (in parallel) ─
    await updateJob(jobId, { stage: "researching", progress: 10, detail: "Writing introduction & starting research..." });

    await Promise.all([
      // Intro writer (runs concurrently with research)
      (async () => {
        log.stageStart("intro", "Writing introduction...");
        const introTimer = startTimer();
        await introWriterAgent(ctx);
        log.stageEnd("intro", introTimer(), `Title: "${ctx.intro?.title}"`);
      })(),

      // Deep research across all 5 dimensions in parallel
      (async () => {
        log.stageStart("research", `Deep research across 5 dimensions (max ${effectiveMaxRounds} rounds each)`);
        const researchTimer = startTimer();
        await batchProcess(DIMENSION_KEYS as unknown as DimensionKey[], 5, async (dim, i) => {
          const dimTimer = startTimer();
          log.info(`Starting research: ${DIMENSION_LABELS[dim]}`, { dimension: dim });
          await deepResearchLoop(ctx, dim, async (round, detail) => {
            const baseProgress = 12 + i * 11;
            const roundProgress = Math.min(round * 3, 11);
            await updateJob(jobId, {
              progress: Math.min(baseProgress + roundProgress, 68),
              detail,
            });
          }, maxRounds);
          const dimData = ctx.dimensions[dim];
          log.researchComplete(
            DIMENSION_LABELS[dim],
            dimData.allSources.length,
            dimData.allFindings.length,
            dimData.researchRounds.length,
            dimTimer()
          );
        });
        log.stageEnd("research", researchTimer());
      })(),
    ]);

    // ─── Step 4: Write chapters ─────────────────────────
    log.stageStart("writing", "Writing report chapters...");
    const writeTimer = startTimer();
    await updateJob(jobId, { stage: "writing", progress: 70, detail: "Writing report chapters..." });
    await batchProcess(DIMENSION_KEYS as unknown as DimensionKey[], 5, async (dim, i) => {
      const chapterTimer = startTimer();
      await updateJob(jobId, {
        detail: `Writing ${DIMENSION_LABELS[dim]} chapter...`,
        progress: 70 + i * 2,
      });
      const result = await writeChapter(ctx, dim);
      log.chapterWritten(
        DIMENSION_LABELS[dim],
        result.chapter_html.length,
        result.sources_used.length,
        chapterTimer()
      );
    });
    log.stageEnd("writing", writeTimer());

    // ─── Step 5: Score dimensions ───────────────────────
    log.stageStart("scoring", "Scoring dimensions...");
    const scoreTimer = startTimer();
    await updateJob(jobId, { stage: "scoring", progress: 80, detail: "Scoring dimensions..." });
    await batchProcess(DIMENSION_KEYS as unknown as DimensionKey[], 5, async (dim, i) => {
      const dimScoreTimer = startTimer();
      await updateJob(jobId, {
        detail: `Scoring ${DIMENSION_LABELS[dim]}...`,
        progress: 80 + i * 2,
      });
      await scorerAgent(ctx, dim);
      const score = ctx.dimensions[dim].score?.score;
      log.dimensionScored(DIMENSION_LABELS[dim], score ?? 0, dimScoreTimer());
    });
    log.stageEnd("scoring", scoreTimer());

    // ─── Step 6: Scoring summary ────────────────────────
    log.stageStart("summary", "Generating scoring summary...");
    const summaryTimer = startTimer();
    await updateJob(jobId, { progress: 90, detail: "Generating scoring summary..." });
    await scoringSummaryAgent(ctx);
    log.summaryScored(
      ctx.scoringSummary?.overall_score ?? 0,
      ctx.scoringSummary?.recommendation ?? "UNKNOWN",
      summaryTimer()
    );

    // ─── Step 7: Build global source index and assemble ─
    log.stageStart("assembly", "Assembling report...");
    const assemblyTimer = startTimer();
    await updateJob(jobId, { stage: "generating", progress: 92, detail: "Assembling report..." });
    ctx.globalSourceIndex = buildGlobalSourceIndex(ctx);

    const totalSources = ctx.globalSourceIndex.length;
    await updateJob(jobId, {
      progress: 95,
      detail: `Assembling report with ${totalSources} sources...`,
    });

    const report = assembleReport(ctx);
    log.reportAssembled(report.length, totalSources, assemblyTimer());

    // Extract scores for DB denormalization
    const marketScore = ctx.dimensions.market_environment?.score?.score ?? null;
    const competitionScore = ctx.dimensions.competition?.score?.score ?? null;
    const costScore = ctx.dimensions.cost_difficulty?.score?.score ?? null;
    const productScore = ctx.dimensions.product_need?.score?.score ?? null;
    const financialScore = ctx.dimensions.financial_return?.score?.score ?? null;
    const overallScore = ctx.scoringSummary?.overall_score ?? null;
    const recommendation = ctx.scoringSummary?.recommendation ?? null;

    log.data("Final scores", {
      market: marketScore,
      competition: competitionScore,
      cost: costScore,
      product: productScore,
      financial: financialScore,
      overall: overallScore,
      recommendation,
    });

    // ─── Done — persist to DB ───────────────────────────
    const dbTimer = startTimer();
    await updateJob(jobId, {
      stage: "delivering",
      progress: 100,
      status: "COMPLETED",
      detail: `Report complete — ${totalSources} sources across 5 dimensions`,
      reportHtml: report,
      contextJson: JSON.stringify(ctx),
      overallScore: overallScore ?? undefined,
      recommendation: recommendation ?? undefined,
      marketScore: marketScore ?? undefined,
      competitionScore: competitionScore ?? undefined,
      costScore: costScore ?? undefined,
      productScore: productScore ?? undefined,
      financialScore: financialScore ?? undefined,
      completedAt: new Date(),
    });
    log.dbWrite("Final report persisted", dbTimer());

    log.pipelineEnd(pipelineTimer(), totalSources, overallScore);

    // Fire-and-forget email notification
    try {
      const { sendReportReadyEmail } = await import("@/lib/email/service");
      sendReportReadyEmail(jobId).catch((emailErr: unknown) => {
        log.warn("Email notification failed", { error: String(emailErr) });
      });
    } catch {
      log.debug("Email module not available — skipping notification");
    }
  } catch (err) {
    log.pipelineFail(err, pipelineTimer());
    await updateJob(jobId, {
      stage: "failed",
      status: "FAILED",
      error: err instanceof Error ? err.message : "Pipeline failed",
      detail: "An error occurred during report generation",
    });
  }
}
