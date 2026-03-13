import pptxgen from "pptxgenjs";
import type { DeckNarrative, SlideNarrative } from "./narrator";

// ── Mudita Design System ──────────────────────────────────────────
const C = {
  bg: "0F1724",
  card: "1E2D42",
  cardAlt: "162336",
  accent: "00C9A7",
  accentDk: "00A88B",
  white: "FFFFFF",
  body: "A0B1C5",
  muted: "5A6B80",
  dimBg: "0D1320",
};
const FONT = { head: "Trebuchet MS", body: "Calibri" };

const makeShadow = (): pptxgen.ShadowProps => ({
  type: "outer", color: "000000", blur: 12, offset: 4, angle: 135, opacity: 0.3,
});

// ── Types ─────────────────────────────────────────────────────────
export type DimensionScore = {
  score: number;
  justification: string;
  strengths: string[];
  weaknesses: string[];
  key_risk: string;
};

export type BuilderData = {
  reportName: string;
  searchTopic: string;
};

// ── Helpers ───────────────────────────────────────────────────────
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

function addFooter(slide: pptxgen.Slide) {
  // Subtle gradient-like footer — just a thin line, not a bar
  slide.addShape("rect", {
    x: 0.7, y: 5.4, w: 8.6, h: 0.006,
    fill: { color: C.accent },
  });
  slide.addText("Confidential", {
    x: 0.7, y: 5.42, w: 8.6, h: 0.2,
    fontSize: 7, fontFace: FONT.body, color: C.muted, align: "right", margin: 0,
  });
}

/**
 * Standard content slide — cinematic layout.
 * Headline dominates. Body is one sentence. Bullets are visual cards.
 */
function addContentSlide(
  pres: pptxgen,
  narr: SlideNarrative,
  slideLabel: string
) {
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // ── Ambient glow — subtle accent rectangle behind headline area ──
  s.addShape("rect", {
    x: 0, y: 0, w: 10, h: 2.2,
    fill: { color: C.dimBg },
  });

  // ── Slide label (small, muted, top-left) ──
  s.addText(slideLabel.toUpperCase(), {
    x: 0.7, y: 0.35, w: 3, h: 0.22,
    fontSize: 8, fontFace: FONT.head, color: C.accent, bold: true,
    charSpacing: 4, margin: 0,
  });

  // ── Headline (big, cinematic) ──
  s.addText(narr.headline, {
    x: 0.7, y: 0.65, w: 8.6, h: 1.0,
    fontSize: 36, fontFace: FONT.head, color: C.white, bold: true, margin: 0,
    lineSpacingMultiple: 1.1,
  });

  // ── Body — one sentence, breathing room ──
  s.addText(narr.body, {
    x: 0.7, y: 1.7, w: 7, h: 0.4,
    fontSize: 13, fontFace: FONT.body, color: C.body, margin: 0,
  });

  // ── Accent divider ──
  s.addShape("rect", {
    x: 0.7, y: 2.35, w: 1.2, h: 0.04,
    fill: { color: C.accent },
  });

  // ── Bullet cards — tall vertical cards, cinematic spacing ──
  const bullets = narr.bullets.slice(0, 4);
  const count = bullets.length;
  if (count === 0) {
    addFooter(s);
    return;
  }

  const gap = 0.25;
  const totalW = 8.6;
  const cardW = (totalW - gap * (count - 1)) / count;
  const cardY = 2.7;
  const cardH = 2.4;

  for (let i = 0; i < count; i++) {
    const cx = 0.7 + i * (cardW + gap);

    // Card
    s.addShape("rect", {
      x: cx, y: cardY, w: cardW, h: cardH,
      fill: { color: C.card }, shadow: makeShadow(), rectRadius: 0.1,
    });

    // Accent left edge
    s.addShape("rect", {
      x: cx, y: cardY, w: 0.05, h: cardH,
      fill: { color: C.accent }, rectRadius: 0.025,
    });

    // Large number (cinematic stat-like feel)
    s.addText(`0${i + 1}`, {
      x: cx + 0.2, y: cardY + 0.25, w: 1, h: 0.6,
      fontSize: 28, fontFace: FONT.head, color: C.accent, bold: true, margin: 0,
    });

    // Bullet text — fills the card
    s.addText(truncate(bullets[i], 100), {
      x: cx + 0.2, y: cardY + 1.0, w: cardW - 0.4, h: cardH - 1.3,
      fontSize: 12, fontFace: FONT.body, color: C.white, valign: "top", margin: 0,
      lineSpacingMultiple: 1.35,
    });
  }

  addFooter(s);
}

// ── Build ─────────────────────────────────────────────────────────

export async function buildDeck(
  data: BuilderData,
  narrative: DeckNarrative
): Promise<Buffer> {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Mudita Studios";
  pres.title = data.reportName;

  // ═══════════════════════════════════════════════════════════════
  // SLIDE 1 — TITLE (cinematic, minimal)
  // ═══════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };

    // Top accent line
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });

    // Subtle dark panel behind title area
    s.addShape("rect", {
      x: 0, y: 0.04, w: 10, h: 3.5,
      fill: { color: C.dimBg },
    });

    // Name — large, centered, dominant
    s.addText(data.reportName, {
      x: 0.5, y: 1.0, w: 9, h: 1.2,
      fontSize: 48, fontFace: FONT.head, color: C.white, bold: true,
      align: "center", valign: "middle", margin: 0,
    });

    // Accent divider
    s.addShape("rect", {
      x: 4.0, y: 2.4, w: 2, h: 0.04,
      fill: { color: C.accent },
    });

    // Tagline
    s.addText(narrative.tagline, {
      x: 1, y: 2.7, w: 8, h: 0.6,
      fontSize: 18, fontFace: FONT.body, color: C.accent, align: "center", margin: 0,
    });

    // Date
    s.addText(
      new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" }),
      {
        x: 0.5, y: 4.5, w: 9, h: 0.3,
        fontSize: 11, fontFace: FONT.body, color: C.muted, align: "center", margin: 0,
      }
    );

    s.addText("Confidential", {
      x: 0.5, y: 4.85, w: 9, h: 0.25,
      fontSize: 9, fontFace: FONT.body, color: C.muted, align: "center", italic: true, margin: 0,
    });

    // Bottom accent line
    s.addShape("rect", { x: 0, y: 5.585, w: 10, h: 0.04, fill: { color: C.accent } });
  }

  // ═══════════════════════════════════════════════════════════════
  // SLIDES 2–9 — CONTENT (cinematic template)
  // ═══════════════════════════════════════════════════════════════
  const slideOrder: { key: keyof DeckNarrative["slides"]; label: string }[] = [
    { key: "problem", label: "The Problem" },
    { key: "solution", label: "The Solution" },
    { key: "market", label: "Market" },
    { key: "competition", label: "Competition" },
    { key: "business_model", label: "Business Model" },
    { key: "go_to_market", label: "Go-to-Market" },
    { key: "why_now", label: "Why Now" },
    { key: "the_ask", label: "The Ask" },
  ];

  for (const { key, label } of slideOrder) {
    addContentSlide(pres, narrative.slides[key], label);
  }

  // ═══════════════════════════════════════════════════════════════
  // SLIDE 10 — CLOSING (cinematic full-bleed)
  // ═══════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };

    // Top accent
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });

    // Full dark panel
    s.addShape("rect", {
      x: 0, y: 0.04, w: 10, h: 5.5,
      fill: { color: C.dimBg },
    });

    // Closing statement — hero text
    s.addText(narrative.closing_statement, {
      x: 0.7, y: 1.2, w: 8.6, h: 2.0,
      fontSize: 42, fontFace: FONT.head, color: C.white, bold: true,
      align: "center", valign: "middle", margin: 0,
      lineSpacingMultiple: 1.15,
    });

    // Accent divider
    s.addShape("rect", {
      x: 4.0, y: 3.4, w: 2, h: 0.04,
      fill: { color: C.accent },
    });

    // Company name
    s.addText(data.reportName, {
      x: 0.5, y: 3.7, w: 9, h: 0.5,
      fontSize: 18, fontFace: FONT.body, color: C.accent, align: "center", margin: 0,
    });

    // Branding
    s.addText("buildmudita.com", {
      x: 0.5, y: 5.0, w: 9, h: 0.25,
      fontSize: 9, fontFace: FONT.body, color: C.muted, align: "center", margin: 0,
    });

    // Bottom accent
    s.addShape("rect", { x: 0, y: 5.585, w: 10, h: 0.04, fill: { color: C.accent } });
  }

  // ── Output ──────────────────────────────────────────────────────
  const base64 = (await pres.write({ outputType: "base64" })) as string;
  return Buffer.from(base64, "base64");
}
