import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkLabAdmin } from "@/lib/labAdmin";

export const runtime = "nodejs";

const SETTING_KEYS = ["linkedin_partner_id", "linkedin_conversion_id", "google_ads_id", "google_conversion_label", "reddit_pixel_id"];

export async function GET() {
  if (!(await checkLabAdmin())) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const rows = await prisma.labSetting.findMany({ where: { key: { in: SETTING_KEYS } } });
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  if (!(await checkLabAdmin())) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const updates = await req.json() as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    if (!SETTING_KEYS.includes(key)) continue;
    await prisma.labSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return NextResponse.json({ message: "Settings updated" });
}
