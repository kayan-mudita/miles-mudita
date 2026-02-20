import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ideaId = parseInt(id);
  const { direction } = await req.json();

  const idea = await prisma.labIdea.findUnique({ where: { id: ideaId } });
  if (!idea) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const updated = await prisma.labIdea.update({
    where: { id: ideaId },
    data: { votes: { increment: direction === "up" ? 1 : -1 } },
  });

  return NextResponse.json(updated);
}
