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
  try {
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
  } catch (err) {
    console.error("Job status error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
