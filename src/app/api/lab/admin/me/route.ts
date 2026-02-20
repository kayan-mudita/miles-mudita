import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function isAdmin() {
  return async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("lab_admin")?.value;
    const expected = process.env.LAB_ADMIN_TOKEN || "lab-admin-secret";
    return token === expected;
  };
}

export async function GET() {
  const check = isAdmin();
  if (!(await check())) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
