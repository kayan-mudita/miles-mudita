import pptxgen from "pptxgenjs";

// ── Blocklist — reject code that tries to escape the sandbox ─────

const BLOCKLIST = [
  "require(",
  "import ",
  "process.",
  "eval(",
  "fetch(",
  "globalThis",
  "child_process",
  "fs.",
  "fs[",
  "Deno.",
  "Bun.",
  "__dirname",
  "__filename",
  "XMLHttpRequest",
  "WebSocket",
];

// ── Validation ───────────────────────────────────────────────────

export function validateDeckCode(code: string): { valid: boolean; reason?: string } {
  for (const blocked of BLOCKLIST) {
    if (code.includes(blocked)) {
      return { valid: false, reason: `Code contains blocked pattern: ${blocked}` };
    }
  }

  if (!code.includes("pres.addSlide")) {
    return { valid: false, reason: "Code does not create any slides (no pres.addSlide found)" };
  }

  // Count slides — at least 5 expected
  const slideCount = (code.match(/pres\.addSlide/g) || []).length;
  if (slideCount < 5) {
    return { valid: false, reason: `Only ${slideCount} slides found, expected at least 5` };
  }

  return { valid: true };
}

// ── Post-process — fix common Claude mistakes ────────────────────

function postProcess(code: string): string {
  // Fix accidental # prefixes in color strings
  let fixed = code.replace(/#([0-9A-Fa-f]{6})\b/g, "$1");

  // Fix 8-char hex (alpha channel) — strip to 6
  fixed = fixed.replace(
    /color:\s*"([0-9A-Fa-f]{6})[0-9A-Fa-f]{2}"/g,
    'color: "$1"'
  );

  return fixed;
}

// ── Execute Generated Code ───────────────────────────────────────

export async function executeDeckCode(
  code: string,
  data: { reportName: string; searchTopic: string; date: string }
): Promise<Buffer> {
  const processed = postProcess(code);

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Mudita Studios";
  pres.title = data.reportName;

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const fn = new AsyncFunction("pres", "data", processed);

  // Execute with timeout
  await Promise.race([
    fn(pres, data),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Deck code execution timed out (10s)")), 10_000)
    ),
  ]);

  // Generate buffer
  const base64 = (await pres.write({ outputType: "base64" })) as string;
  return Buffer.from(base64, "base64");
}
