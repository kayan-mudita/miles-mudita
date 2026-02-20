import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { APP_URL } from "@/lib/email/config";

export async function generateReportPDF(
  reportId: string,
  token?: string
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Set the auth session cookie so the headless browser can access
    // the protected report page without being redirected to login.
    if (token) {
      const url = new URL(APP_URL);
      await page.setCookie({
        name: "authjs.session-token",
        value: token,
        domain: url.hostname,
        path: "/",
        httpOnly: true,
        secure: url.protocol === "https:",
        sameSite: "Lax",
      });
    }

    // Load the report page
    await page.goto(`${APP_URL}/report/${reportId}?print=true`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Wait for content to render
    await page.waitForSelector("[data-report-content]", { timeout: 30000 });

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
