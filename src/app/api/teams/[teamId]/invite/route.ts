import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;
  const { email, role = "MEMBER" } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Verify the inviter is an owner or admin
  const inviterMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: session.user.id } },
  });

  if (!inviterMembership || (inviterMembership.role !== "OWNER" && inviterMembership.role !== "ADMIN")) {
    return NextResponse.json({ error: "Only owners and admins can invite members" }, { status: 403 });
  }

  // Find the user by email
  const invitedUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!invitedUser) {
    return NextResponse.json({ error: "No user found with that email. They must sign up first." }, { status: 404 });
  }

  // Check if already a member
  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: invitedUser.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "User is already a team member" }, { status: 409 });
  }

  const validRoles = ["ADMIN", "MEMBER"];
  const memberRole = validRoles.includes(role) ? role : "MEMBER";

  await prisma.teamMember.create({
    data: {
      teamId,
      userId: invitedUser.id,
      role: memberRole,
    },
  });

  return NextResponse.json({ success: true });
}
