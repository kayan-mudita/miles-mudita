import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const adminUser = process.env.LAB_ADMIN_USERNAME || "admin";
  const adminPass = process.env.LAB_ADMIN_PASSWORD || "admin";

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = process.env.LAB_ADMIN_TOKEN || "lab-admin-secret";
  const cookieStore = await cookies();
  cookieStore.set("lab_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return NextResponse.json({ message: "Logged in" });
}
