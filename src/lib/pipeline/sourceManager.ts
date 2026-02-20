import { Source, ResearchContext, DIMENSION_KEYS, DIMENSION_LABELS } from "./types";

/** Escape user-controlled strings for safe interpolation into HTML. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sanitize a URL for use in href attributes. Rejects javascript: and other dangerous schemes. */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return escapeHtml(parsed.toString());
    }
  } catch {
    // invalid URL
  }
  return "#";
}

export function deduplicateSources(sources: Source[]): Source[] {
  const seen = new Map<string, Source>();
  for (const s of sources) {
    const key = normalizeUrl(s.url);
    if (!seen.has(key)) {
      seen.set(key, s);
    }
  }
  return Array.from(seen.values());
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    return u.toString().replace(/\/+$/, "");
  } catch {
    return url.toLowerCase().trim();
  }
}

export function buildGlobalSourceIndex(ctx: ResearchContext): Source[] {
  const allSources: Source[] = [];
  for (const key of DIMENSION_KEYS) {
    const dim = ctx.dimensions[key];
    for (const s of dim.allSources) {
      allSources.push({ ...s, dimension: DIMENSION_LABELS[key] });
    }
  }
  return deduplicateSources(allSources);
}

export function formatSourcesGroupedByChapter(ctx: ResearchContext): string {
  const sections: string[] = [];
  let globalIndex = 1;

  for (const key of DIMENSION_KEYS) {
    const dim = ctx.dimensions[key];
    const label = DIMENSION_LABELS[key];
    const lines: string[] = [`<h3>${label}</h3><ol start="${globalIndex}">`];
    for (const s of dim.allSources) {
      lines.push(`<li><a href="${sanitizeUrl(s.url)}" target="_blank">${escapeHtml(s.title)}</a> — ${escapeHtml(s.content.substring(0, 120))}...</li>`);
      globalIndex++;
    }
    lines.push("</ol>");
    sections.push(lines.join("\n"));
  }

  return sections.join("\n");
}
