import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getJob } from "@/lib/pipeline/jobStore";
import { generateReportPDF } from "@/lib/pdf/generator";

export const runtime = "nodejs";

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
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Report not ready" }, { status: 202 });
  }

  try {
    // Extract session token from cookies to pass to headless browser
    const sessionToken =
      req.cookies.get("authjs.session-token")?.value ??
      req.cookies.get("__Secure-authjs.session-token")?.value;

    const pdf = await generateReportPDF(jobId, sessionToken);

    const filename = `${job.reportName.replace(/[^a-zA-Z0-9]/g, "-")}-Report.pdf`;

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
