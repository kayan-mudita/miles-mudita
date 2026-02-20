import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const status = searchParams.get("status");

  // If teamId is provided, verify the user is a member of that team
  if (teamId) {
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const where: Record<string, unknown> = teamId
    ? { teamId }
    : { userId: session.user.id };

  if (status) {
    where.status = status.toUpperCase();
  }

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reportName: true,
      searchTopic: true,
      status: true,
      stage: true,
      progress: true,
      depth: true,
      overallScore: true,
      recommendation: true,
      marketScore: true,
      competitionScore: true,
      costScore: true,
      productScore: true,
      financialScore: true,
      createdAt: true,
      completedAt: true,
      estimatedMinutes: true,
      error: true,
    },
  });

  return NextResponse.json({ reports });
}
