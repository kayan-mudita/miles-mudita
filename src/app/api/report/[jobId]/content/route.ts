import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getJob } from "@/lib/pipeline/jobStore";

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
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
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

  if (job.status !== "COMPLETED" || !job.reportHtml) {
    return NextResponse.json(
      { error: "Report not ready", status: job.status.toLowerCase(), stage: job.stage },
      { status: 202 }
    );
  }

  // Parse context from stored JSON if available
  let scores = null;
  let summary = null;
  let intro = null;
  let totalSources = 0;

  if (job.contextJson) {
    try {
      const ctx = JSON.parse(job.contextJson);
      const dims = ctx.dimensions as Record<string, Record<string, unknown>>;
      scores = dims
        ? Object.fromEntries(
            Object.entries(dims).map(([k, v]) => [
              k,
              v.score
                ? {
                    score: (v.score as Record<string, unknown>).score,
                    justification: (v.score as Record<string, unknown>).justification,
                    strengths: (v.score as Record<string, unknown>).strengths,
                    weaknesses: (v.score as Record<string, unknown>).weaknesses,
                    key_risk: (v.score as Record<string, unknown>).key_risk,
                  }
                : null,
            ])
          )
        : null;
      summary = ctx.scoringSummary || null;
      intro = ctx.intro || null;
      totalSources = ctx.globalSourceIndex?.length || 0;
    } catch {
      // Context parse failed — use denormalized scores
    }
  }

  // Fall back to denormalized scores if context parsing failed
  if (!scores && job.overallScore != null) {
    scores = {
      market_environment: job.marketScore != null ? { score: job.marketScore } : null,
      competition: job.competitionScore != null ? { score: job.competitionScore } : null,
      cost_difficulty: job.costScore != null ? { score: job.costScore } : null,
      product_need: job.productScore != null ? { score: job.productScore } : null,
      financial_return: job.financialScore != null ? { score: job.financialScore } : null,
    };
  }

  return NextResponse.json({
    id: job.id,
    status: job.status.toLowerCase(),
    reportName: job.reportName,
    searchTopic: job.searchTopic,
    report: job.reportHtml,
    scores,
    summary,
    intro,
    totalSources,
    overallScore: job.overallScore,
    recommendation: job.recommendation,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
}
