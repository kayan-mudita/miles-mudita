import type { Handler, HandlerEvent } from "@netlify/functions";
import { runPipeline } from "../../src/lib/pipeline/orchestrator";

/**
 * Netlify Background Function — runs the pipeline directly.
 *
 * The `-background` suffix tells Netlify to:
 * - Return 202 Accepted immediately to the caller
 * - Run this function for up to 15 minutes in the background
 *
 * Flow:
 * 1. /api/submit creates the job, then calls this background function
 * 2. This function runs the pipeline directly (no HTTP hop to API route),
 *    giving it the full 15-minute background function timeout.
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

    // Run the pipeline directly — this has the full 15-minute timeout
    console.log(`[background] Starting pipeline for job ${jobId} (maxRounds=${maxRounds})`);
    await runPipeline(jobId, searchTopic, reportName, maxRounds);
    console.log(`[background] Pipeline completed for job ${jobId}`);

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
