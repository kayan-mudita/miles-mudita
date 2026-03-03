import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lab_admin")?.value;
    const expected = process.env.LAB_ADMIN_TOKEN;
    if (!expected || token !== expected) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true });
  } catch (err) {
    console.error("Admin me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
