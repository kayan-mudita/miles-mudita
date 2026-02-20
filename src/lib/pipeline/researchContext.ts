import { ResearchContext, DIMENSION_KEYS, DIMENSION_LABELS, DimensionKey } from "./types";

export function createResearchContext(searchTopic: string, reportName: string): ResearchContext {
  const dimensions: ResearchContext["dimensions"] = {};
  for (const key of DIMENSION_KEYS) {
    dimensions[key] = {
      topic: "",
      subQuestions: [],
      researchRounds: [],
      allSources: [],
      allFindings: "",
      chapter: null,
      score: null,
    };
  }

  return {
    searchTopic,
    reportName,
    topics: null,
    intro: null,
    dimensions,
    crossDimensionInsights: [],
    globalSourceIndex: [],
    scoringSummary: null,
  };
}

export function serializeDimensionForWriter(ctx: ResearchContext, dim: DimensionKey): string {
  const dimData = ctx.dimensions[dim];
  const otherDims = DIMENSION_KEYS.filter((k) => k !== dim)
    .map((k) => {
      const d = ctx.dimensions[k];
      return `${DIMENSION_LABELS[k]}: ${d.allFindings?.substring(0, 400) || "Not yet researched"}`;
    })
    .join("\n\n");

  const sourcesText = dimData.allSources
    .map((s, i) => `[${i + 1}] ${s.title} - ${s.url}`)
    .join("\n");

  return `Search Topic: ${ctx.searchTopic}
Report Name: ${ctx.reportName}
Dimension: ${DIMENSION_LABELS[dim]}
Chapter Heading: ${ctx.intro?.["chapter_" + (DIMENSION_KEYS.indexOf(dim) + 1) as keyof typeof ctx.intro] || DIMENSION_LABELS[dim]}

Full Research Findings for This Dimension:
${dimData.allFindings}

Sources (${dimData.allSources.length}):
${sourcesText}

Cross-Dimension Context (key findings from other dimensions):
${otherDims}`;
}

export function serializeDimensionForScorer(ctx: ResearchContext, dim: DimensionKey): string {
  const dimData = ctx.dimensions[dim];
  const otherScores = DIMENSION_KEYS.filter((k) => k !== dim)
    .map((k) => {
      const d = ctx.dimensions[k];
      if (d.score) {
        return `${DIMENSION_LABELS[k]}: ${d.score.score}/10`;
      }
      return null;
    })
    .filter(Boolean)
    .join(", ");

  return `Search Topic: ${ctx.searchTopic}
Dimension: ${DIMENSION_LABELS[dim]}

Chapter Content (excerpt):
${dimData.chapter?.chapter_html?.substring(0, 3000) || ""}

Research Sources (${dimData.allSources.length}):
${dimData.allSources.map((s, i) => `[${i + 1}] ${s.title} - ${s.url}`).join("\n")}

Research Findings:
${dimData.allFindings}

${otherScores ? `Other Dimension Scores (for calibration): ${otherScores}` : ""}`;
}

export function serializeAllScoresForSummary(ctx: ResearchContext): string {
  return DIMENSION_KEYS.map((k) => {
    const d = ctx.dimensions[k];
    if (!d.score) return `${DIMENSION_LABELS[k]}: Not scored`;
    return `${DIMENSION_LABELS[k]}:
  Score: ${d.score.score}/10
  Justification: ${d.score.justification}
  Strengths: ${d.score.strengths.join("; ")}
  Weaknesses: ${d.score.weaknesses.join("; ")}
  Key Risk: ${d.score.key_risk}`;
  }).join("\n\n");
}
