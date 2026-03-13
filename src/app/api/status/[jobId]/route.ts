import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getJob } from "@/lib/pipeline/jobStore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id || req.cookies.get("miles_anon_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Verify ownership: user owns the report or is a member of the report's team
  const isOwner = job.userId === userId;
  const isTeamMember =
    job.teamId &&
    session?.user?.id &&
    (await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: job.teamId, userId: session.user.id } },
    }));
  if (!isOwner && !isTeamMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Detect stale RUNNING jobs — if no DB update for 5 minutes, mark as failed.
  // This recovers from server crashes that kill the pipeline mid-run.
  const STALE_THRESHOLD_MS = 5 * 60 * 1000;
  let status = job.status;
  let error = job.error;
  let detail = job.detail;
  let stage = job.stage;

  if (
    job.status === "RUNNING" &&
    Date.now() - new Date(job.updatedAt).getTime() > STALE_THRESHOLD_MS
  ) {
    const failMsg = "Pipeline stopped unexpectedly. Please retry your report.";
    await prisma.report.update({
      where: { id: job.id },
      data: { status: "FAILED", stage: "failed", error: failMsg, detail: failMsg },
    });
    status = "FAILED";
    error = failMsg;
    detail = failMsg;
    stage = "failed";
  }

  return NextResponse.json({
    id: job.id,
    status: status.toLowerCase(),
    stage,
    progress: job.progress,
    detail,
    error,
    hasReport: !!job.reportHtml,
    estimatedMinutes: job.estimatedMinutes,
    depth: job.depth,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
}
