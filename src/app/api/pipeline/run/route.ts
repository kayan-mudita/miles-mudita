import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/orchestrator";
import { pipelineLog } from "@/lib/pipeline/logger";

export const runtime = "nodejs";

/**
 * Internal API route that executes the research pipeline.
 * Called by the Netlify background function — NOT directly by clients.
 * Authenticated via x-pipeline-secret header.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-pipeline-secret");
    const expectedSecret =
      process.env.PIPELINE_SECRET || process.env.AUTH_SECRET;

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, searchTopic, reportName, maxRounds } = await req.json();

    if (!jobId || !searchTopic || !reportName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    pipelineLog.info("Pipeline run triggered", {
      data: { jobId, maxRounds },
    });

    await runPipeline(jobId, searchTopic, reportName, maxRounds ?? 3);

    return NextResponse.json({ success: true });
  } catch (err) {
    pipelineLog.error("Pipeline run failed", {
      error: (err as Error).message || String(err),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
