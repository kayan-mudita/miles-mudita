import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("lab_admin");
    return NextResponse.json({ message: "Logged out" });
  } catch (err) {
    console.error("Admin logout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
