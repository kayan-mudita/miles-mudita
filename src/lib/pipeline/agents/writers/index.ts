import { ResearchContext, DimensionKey, WriterOutput } from "../../types";
import { writeMarketEnvironment } from "./marketEnvironment";
import { writeCompetition } from "./competition";
import { writeCostDifficulty } from "./costDifficulty";
import { writeProductNeed } from "./productNeed";
import { writeFinancialReturn } from "./financialReturn";
import { pipelineLog, startTimer } from "../../logger";

const writerMap: Record<DimensionKey, (ctx: ResearchContext) => Promise<WriterOutput>> = {
  market_environment: writeMarketEnvironment,
  competition: writeCompetition,
  cost_difficulty: writeCostDifficulty,
  product_need: writeProductNeed,
  financial_return: writeFinancialReturn,
};

export async function writeChapter(ctx: ResearchContext, dim: DimensionKey): Promise<WriterOutput> {
  const timer = startTimer();
  const writer = writerMap[dim];
  const result = await writer(ctx);

  pipelineLog.info("Chapter written", {
    dimension: dim,
    durationMs: timer(),
    data: {
      htmlLength: result.chapter_html?.length ?? 0,
      sourcesCited: result.sources_used?.length ?? 0,
    },
  });

  return result;
}
