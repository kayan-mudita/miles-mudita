import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkLabAdmin } from "@/lib/labAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!(await checkLabAdmin())) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.labWaitlist.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.labWaitlist.count(),
  ]);

  return NextResponse.json({ entries, total });
}
