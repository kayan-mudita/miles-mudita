import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, ideaId, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = body;
  if (!email) return NextResponse.json({ message: "Email required" }, { status: 400 });

  await prisma.labWaitlist.create({
    data: { email, ideaId: ideaId ?? null, utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
  });

  return NextResponse.json({ message: "Joined waitlist" }, { status: 201 });
}
