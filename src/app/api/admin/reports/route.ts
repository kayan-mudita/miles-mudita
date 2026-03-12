import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/** Verify lab_admin cookie matches LAB_ADMIN_TOKEN env var */
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("lab_admin")?.value;
  const expected = process.env.LAB_ADMIN_TOKEN;
  return !!expected && token === expected;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const depth = searchParams.get("depth");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status.toUpperCase();
    if (depth && depth !== "all") where.depth = depth.toUpperCase();

    const [reports, total, stats] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
          emailSent: true,
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.report.count({ where }),
      prisma.report.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of stats) {
      statusCounts[s.status] = s._count.id;
    }

    return NextResponse.json({ reports, total, page, limit, statusCounts });
  } catch (err) {
    console.error("Admin reports GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
