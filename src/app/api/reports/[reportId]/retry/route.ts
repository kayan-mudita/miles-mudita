import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getApiKey } from "@/lib/pipeline/runAgent";
import { pipelineLog } from "@/lib/pipeline/logger";

export const runtime = "nodejs";

const DEPTH_ROUNDS: Record<string, number> = {
  QUICK: 1,
  STANDARD: 3,
  DEEP: 5,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = await params;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (report.status !== "FAILED") {
    return NextResponse.json({ error: "Only failed reports can be retried" }, { status: 400 });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 500 });
  }

  // Reset the report state
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "RUNNING",
      stage: "queued",
      progress: 0,
      detail: "Retrying report generation...",
      error: null,
      reportHtml: null,
      contextJson: null,
      overallScore: null,
      recommendation: null,
      marketScore: null,
      competitionScore: null,
      costScore: null,
      productScore: null,
      financialScore: null,
      completedAt: null,
      emailSent: false,
      emailSentAt: null,
    },
  });

  const maxRounds = DEPTH_ROUNDS[report.depth] ?? 3;

  // Trigger pipeline — same pattern as /api/submit
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pipelineSecret =
    process.env.PIPELINE_SECRET || process.env.AUTH_SECRET || "";
  const isNetlify = !!process.env.NETLIFY;

  if (isNetlify) {
    const bgUrl = `${appUrl}/.netlify/functions/run-pipeline-background`;
    fetch(bgUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pipeline-secret": pipelineSecret,
      },
      body: JSON.stringify({
        jobId: reportId,
        searchTopic: report.searchTopic,
        reportName: report.reportName,
        maxRounds,
      }),
    }).catch((err) => {
      pipelineLog.error(`Failed to trigger background function for retry ${reportId}`, {
        error: (err as Error).message || String(err),
      });
    });
  } else {
    const { runPipeline } = await import("@/lib/pipeline/orchestrator");
    runPipeline(reportId, report.searchTopic, report.reportName, maxRounds).catch((err) => {
      console.error(`Retry pipeline failed for job ${reportId}:`, err);
    });
  }

  return NextResponse.json({ success: true, jobId: reportId });
}
