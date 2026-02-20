import type { Handler, HandlerEvent } from "@netlify/functions";

/**
 * Netlify Background Function — triggers the pipeline via the Next.js API.
 *
 * The `-background` suffix tells Netlify to:
 * - Return 202 Accepted immediately to the caller
 * - Run this function for up to 15 minutes in the background
 *
 * Flow:
 * 1. /api/submit creates the job, then calls this background function
 * 2. This function calls /api/pipeline/run (a Next.js API route) which
 *    executes the actual pipeline with full access to Prisma, agents, etc.
 */
const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { jobId, searchTopic, reportName, maxRounds } = JSON.parse(
      event.body || "{}"
    );

    if (!jobId || !searchTopic || !reportName) {
      return { statusCode: 400, body: "Missing required fields" };
    }

    // Verify the secret to prevent unauthorized invocations
    const authHeader = event.headers["x-pipeline-secret"];
    const expectedSecret =
      process.env.PIPELINE_SECRET || process.env.AUTH_SECRET;
    if (!authHeader || authHeader !== expectedSecret) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    // Call the internal Next.js API route that runs the pipeline
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "";
    const res = await fetch(`${appUrl}/api/pipeline/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pipeline-secret": authHeader,
      },
      body: JSON.stringify({ jobId, searchTopic, reportName, maxRounds }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pipeline API returned error:", res.status, text);
      return { statusCode: res.status, body: text };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Background pipeline failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Pipeline failed",
      }),
    };
  }
};

export { handler };
