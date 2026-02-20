import { ResearchContext, DIMENSION_KEYS, DIMENSION_LABELS } from "./types";
import { formatSourcesGroupedByChapter } from "./sourceManager";

/** Escape user-controlled strings for safe interpolation into HTML. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function assembleReport(ctx: ResearchContext): string {
  const { intro, scoringSummary } = ctx;
  if (!intro || !scoringSummary) {
    throw new Error("Missing intro or scoring summary");
  }

  const recommendationClass =
    scoringSummary.recommendation === "GO"
      ? "go"
      : scoringSummary.recommendation === "NO-GO"
      ? "nogo"
      : "conditional";

  const scoreCards = DIMENSION_KEYS.map((k) => {
    const d = ctx.dimensions[k];
    const score = d.score?.score ?? 0;
    return `<div class="score-card">
      <div class="score-label">${DIMENSION_LABELS[k]}</div>
      <div class="score-value">${score.toFixed(1)}</div>
      <div class="score-max">/10</div>
    </div>`;
  }).join("\n");

  const chapters = DIMENSION_KEYS.map((k, i) => {
    const d = ctx.dimensions[k];
    const heading = intro[`chapter_${i + 1}` as keyof typeof intro] || DIMENSION_LABELS[k];
    return `<section class="chapter" id="chapter-${i + 1}">
      <h2>Chapter ${i + 1}: ${escapeHtml(heading)}</h2>
      ${d.chapter?.chapter_html || "<p>Chapter content unavailable.</p>"}
    </section>`;
  }).join("\n\n");

  const scoringDetails = DIMENSION_KEYS.map((k) => {
    const d = ctx.dimensions[k];
    if (!d.score) return "";
    return `<div class="scoring-detail">
      <h3>${DIMENSION_LABELS[k]} — ${d.score.score.toFixed(1)}/10</h3>
      <p>${escapeHtml(d.score.justification)}</p>
      <div class="score-lists">
        <div>
          <h4>Strengths</h4>
          <ul>${d.score.strengths.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
        </div>
        <div>
          <h4>Weaknesses</h4>
          <ul>${d.score.weaknesses.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>
        </div>
      </div>
      <p class="key-risk"><strong>Key Risk:</strong> ${escapeHtml(d.score.key_risk)}</p>
    </div>`;
  }).join("\n");

  const sourcesHtml = formatSourcesGroupedByChapter(ctx);

  const totalSources = DIMENSION_KEYS.reduce(
    (sum, k) => sum + ctx.dimensions[k].allSources.length,
    0
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(intro.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      line-height: 1.8;
      color: #1a1a2e;
      background: #fafaf8;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #0d0d1a; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; color: #0d0d1a; border-bottom: 2px solid #c9a84c; padding-bottom: 0.5rem; }
    h3 { font-size: 1.2rem; margin: 1.5rem 0 0.75rem; color: #2a2a4a; }
    h4 { font-size: 1rem; margin: 1rem 0 0.5rem; color: #4a4a6a; }
    p { margin: 0.75rem 0; text-align: justify; }
    ul, ol { margin: 0.75rem 0 0.75rem 1.5rem; }
    li { margin: 0.4rem 0; }
    a { color: #c9a84c; text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 0.9rem; }
    th { background: #f0ede4; font-weight: bold; }
    .report-header { text-align: center; margin-bottom: 3rem; padding: 2rem 0; border-bottom: 3px solid #c9a84c; }
    .report-header .subtitle { color: #666; font-size: 0.9rem; margin-top: 0.5rem; }
    .score-dashboard { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin: 2rem 0; }
    .score-card { background: #0d0d1a; color: #fff; border-radius: 8px; padding: 1.25rem; text-align: center; }
    .score-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c9a84c; margin-bottom: 0.5rem; }
    .score-value { font-size: 2.5rem; font-weight: bold; color: #c9a84c; }
    .score-max { font-size: 0.8rem; color: #888; }
    .overall-score { text-align: center; margin: 1.5rem 0; }
    .overall-score .value { font-size: 3rem; font-weight: bold; color: #c9a84c; }
    .recommendation { display: inline-block; padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: bold; font-size: 1.1rem; margin: 0.5rem 0; }
    .recommendation.go { background: #d4edda; color: #155724; }
    .recommendation.nogo { background: #f8d7da; color: #721c24; }
    .recommendation.conditional { background: #fff3cd; color: #856404; }
    .executive-summary { background: #f8f6f0; border: 1px solid #e0dcd0; border-radius: 8px; padding: 2rem; margin: 2rem 0; }
    .chapter { margin: 3rem 0; }
    .scoring-detail { background: #f8f6f0; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .score-lists { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
    .key-risk { color: #721c24; font-style: italic; }
    .sources-section { margin: 3rem 0; font-size: 0.85rem; }
    .sources-section ol { padding-left: 2rem; }
    .sources-section li { margin: 0.3rem 0; }
    @media (max-width: 768px) {
      .score-dashboard { grid-template-columns: repeat(2, 1fr); }
      .score-lists { grid-template-columns: 1fr; }
      body { padding: 20px 16px; }
    }
    @media (max-width: 480px) {
      .score-dashboard { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<header class="report-header">
  <h1>${escapeHtml(intro.title)}</h1>
  <p class="subtitle">${escapeHtml(ctx.reportName)} &middot; Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} &middot; ${totalSources} Sources</p>
</header>

<section>
  <div class="score-dashboard">
    ${scoreCards}
  </div>
  <div class="overall-score">
    <div class="value">${scoringSummary.overall_score.toFixed(1)}</div>
    <div>Overall Score</div>
    <div class="recommendation ${recommendationClass}">${scoringSummary.recommendation}</div>
  </div>
</section>

<section class="executive-summary">
  <h2>Executive Summary</h2>
  ${scoringSummary.executive_summary_html}
</section>

<nav>
  <h2>Table of Contents</h2>
  <ol>
    ${DIMENSION_KEYS.map((k, i) => {
      const heading = intro[`chapter_${i + 1}` as keyof typeof intro] || DIMENSION_LABELS[k];
      return `<li><a href="#chapter-${i + 1}">${escapeHtml(heading)}</a></li>`;
    }).join("\n    ")}
    <li><a href="#scoring-details">Detailed Scoring</a></li>
    <li><a href="#sources">Sources</a></li>
  </ol>
</nav>

${intro.introduction}

${chapters}

<section id="scoring-details">
  <h2>Detailed Scoring</h2>
  ${scoringSummary.scoring_table_html}
  ${scoringDetails}
</section>

<section id="sources" class="sources-section">
  <h2>Sources (${totalSources})</h2>
  ${sourcesHtml}
</section>

</body>
</html>`;
}
