import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkLabAdmin } from "@/lib/labAdmin";

export const runtime = "nodejs";

export async function GET() {
  if (!(await checkLabAdmin())) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const entries = await prisma.labWaitlist.findMany({ orderBy: { createdAt: "desc" } });

  const header = "Email,Idea ID,UTM Source,UTM Medium,UTM Campaign,UTM Content,UTM Term,Date";
  const rows = entries.map((e) => {
    const date = e.createdAt ? new Date(e.createdAt).toISOString() : "";
    return [e.email, e.ideaId ?? "", e.utmSource ?? "", e.utmMedium ?? "", e.utmCampaign ?? "", e.utmContent ?? "", e.utmTerm ?? "", date]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=lab-waitlist.csv",
    },
  });
}
