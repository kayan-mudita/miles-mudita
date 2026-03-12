import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("lab_admin")?.value;
  const expected = process.env.LAB_ADMIN_TOKEN;
  return !!expected && token === expected;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        reportName: true,
        searchTopic: true,
        status: true,
        stage: true,
        progress: true,
        detail: true,
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
        updatedAt: true,
        estimatedMinutes: true,
        error: true,
        emailSent: true,
        emailSentAt: true,
        contextJson: true,
        user: { select: { id: true, email: true, name: true, createdAt: true } },
        team: { select: { id: true, name: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Parse contextJson to extract executive summary and scoring table if available
    let executiveSummary: string | null = null;
    let scoringTable: string | null = null;
    let topStrengths: string[] = [];
    let topRisks: string[] = [];

    if (report.contextJson) {
      try {
        const ctx = JSON.parse(report.contextJson);
        if (ctx.scoringSummary) {
          executiveSummary = ctx.scoringSummary.executive_summary_html || null;
          scoringTable = ctx.scoringSummary.scoring_table_html || null;
          topStrengths = ctx.scoringSummary.strengths || [];
          topRisks = ctx.scoringSummary.risks || [];
        }
      } catch {
        // ignore parse errors
      }
    }

    return NextResponse.json({
      report: {
        ...report,
        contextJson: undefined, // don't send the full blob
        executiveSummary,
        scoringTable,
        topStrengths,
        topRisks,
      },
    });
  } catch (err) {
    console.error("Admin report detail error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action === "kill") {
      const report = await prisma.report.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!report) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      if (report.status !== "RUNNING" && report.status !== "QUEUED") {
        return NextResponse.json(
          { error: `Cannot kill report with status ${report.status}` },
          { status: 400 }
        );
      }

      await prisma.report.update({
        where: { id },
        data: {
          status: "FAILED",
          error: "Killed by admin",
          stage: "killed",
          progress: 0,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Admin report PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
