import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

/**
 * Transfers reports from an anonymous user to the authenticated user,
 * then deletes the anonymous user row and clears the cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const anonId = req.cookies.get("miles_anon_id")?.value;
    if (!anonId) {
      return NextResponse.json({ success: true, transferred: 0 });
    }

    // Verify anonymous user exists and is actually anonymous
    const anonUser = await prisma.user.findUnique({ where: { id: anonId } });
    if (!anonUser || !anonUser.isAnonymous) {
      // Cookie is stale or invalid — just clear it
      const response = NextResponse.json({ success: true, transferred: 0 });
      response.cookies.set("miles_anon_id", "", { maxAge: 0, path: "/" });
      return response;
    }

    // Don't merge with yourself
    if (anonId === session.user.id) {
      const response = NextResponse.json({ success: true, transferred: 0 });
      response.cookies.set("miles_anon_id", "", { maxAge: 0, path: "/" });
      return response;
    }

    // Transfer all reports from anonymous user to authenticated user
    const result = await prisma.report.updateMany({
      where: { userId: anonId },
      data: { userId: session.user.id },
    });

    // Delete the anonymous user row
    await prisma.user.delete({ where: { id: anonId } });

    // Clear the cookie
    const response = NextResponse.json({
      success: true,
      transferred: result.count,
    });
    response.cookies.set("miles_anon_id", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("Claim anonymous error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
