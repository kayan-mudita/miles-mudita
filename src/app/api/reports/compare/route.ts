import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ error: "Report IDs required (comma-separated)" }, { status: 400 });
  }

  const reportIds = ids.split(",").map((id) => id.trim()).filter(Boolean);

  if (reportIds.length < 2 || reportIds.length > 5) {
    return NextResponse.json({ error: "Provide 2-5 report IDs" }, { status: 400 });
  }

  const reports = await prisma.report.findMany({
    where: {
      id: { in: reportIds },
      userId: session.user.id,
      status: "COMPLETED",
    },
    select: {
      id: true,
      reportName: true,
      searchTopic: true,
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
    },
  });

  return NextResponse.json({ reports });
}
