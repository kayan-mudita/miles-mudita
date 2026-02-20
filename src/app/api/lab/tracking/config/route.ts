import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const SETTING_KEYS = ["linkedin_partner_id", "linkedin_conversion_id", "google_ads_id", "google_conversion_label", "reddit_pixel_id"];

export async function GET() {
  const rows = await prisma.labSetting.findMany({ where: { key: { in: SETTING_KEYS } } });
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return NextResponse.json(result);
}
