import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { prisma } from "@/lib/db";

/**
 * Generate a PDF from the stored report HTML.
 *
 * Reads the already-assembled HTML from the database (complete document with
 * inline styles from assembler.ts) and renders it via Puppeteer + @sparticuz/chromium.
 *
 * Uses page.setContent() instead of navigating to the live report URL, which avoids:
 * - Auth cookie / middleware redirect issues
 * - Serverless self-referencing deadlocks
 * - Chromium timeout issues from HTTP round-trips
 */
export async function generateReportPDF(
  reportId: string,
  _token?: string
): Promise<Buffer> {
  // 1. Fetch the stored report HTML from the database
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { reportHtml: true },
  });

  if (!report?.reportHtml) {
    throw new Error("Report HTML not found in database");
  }

  // 2. Launch headless Chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Set the content directly — no HTTP request, no auth needed
    await page.setContent(report.reportHtml, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "40px",
        right: "40px",
        bottom: "40px",
        left: "40px",
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:8px;color:#999;width:100%;text-align:center;padding:0 40px">
          <span>Miles by Mudita — AI Startup Validation Report</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size:8px;color:#999;width:100%;display:flex;justify-content:space-between;padding:0 40px">
          <span>Confidential</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
