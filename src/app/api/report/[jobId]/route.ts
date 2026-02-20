import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getJob } from "@/lib/pipeline/jobStore";

export const runtime = "nodejs";

/**
 * Returns the current status of a report job as JSON.
 * The frontend polls this endpoint for progress updates.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  // Verify ownership: user owns the report or is a member of the report's team
  const isOwner = job.userId === session.user.id;
  const isTeamMember =
    job.teamId &&
    (await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: job.teamId, userId: session.user.id } },
    }));
  if (!isOwner && !isTeamMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status.toLowerCase(),
    stage: job.stage,
    progress: job.progress,
    detail: job.detail,
    error: job.error,
    hasReport: !!job.reportHtml,
    estimatedMinutes: job.estimatedMinutes,
    depth: job.depth,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
}
