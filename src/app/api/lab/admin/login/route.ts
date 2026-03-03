import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const adminUser = process.env.LAB_ADMIN_USERNAME;
    const adminPass = process.env.LAB_ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return NextResponse.json({ error: "Admin login not configured" }, { status: 503 });
    }

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = process.env.LAB_ADMIN_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Admin login not configured" }, { status: 503 });
    }

    const cookieStore = await cookies();
    cookieStore.set("lab_admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ message: "Logged in" });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
