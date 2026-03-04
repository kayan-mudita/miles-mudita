/**
 * Patch the generated Prisma client to handle CJS bundling.
 *
 * Prisma 7 generates `import.meta.url` in client.ts which crashes when
 * esbuild bundles it into CJS format (for Netlify functions).
 * This script wraps the line in a try/catch so it gracefully falls back.
 */
const fs = require("fs");
const path = require("path");

const clientPath = path.join(__dirname, "..", "src", "generated", "prisma", "client.ts");

if (!fs.existsSync(clientPath)) {
  console.log("[patch-prisma-esm] client.ts not found — skipping");
  process.exit(0);
}

let content = fs.readFileSync(clientPath, "utf8");

const original = "globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))";
const patched = "try { globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url)) } catch { /* CJS fallback */ }";

if (content.includes(original)) {
  content = content.replace(original, patched);
  fs.writeFileSync(clientPath, content, "utf8");
  console.log("[patch-prisma-esm] Patched import.meta.url line for CJS compatibility");
} else if (content.includes(patched)) {
  console.log("[patch-prisma-esm] Already patched — skipping");
} else {
  console.log("[patch-prisma-esm] Expected line not found — skipping (may need update)");
}
