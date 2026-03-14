import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getJob } from "@/lib/pipeline/jobStore";
import { generatePitchDeck, PitchDeckData } from "@/lib/deck/generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth();
    const userId =
      session?.user?.id || req.cookies.get("miles_anon_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify ownership
    const isOwner = job.userId === userId;
    const isTeamMember =
      job.teamId &&
      session?.user?.id &&
      (await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: job.teamId, userId: session.user.id },
        },
      }));
    if (!isOwner && !isTeamMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (job.status !== "COMPLETED" || !job.contextJson) {
      return NextResponse.json({ error: "Report not ready" }, { status: 202 });
    }

    const filename = `${job.reportName.replace(/[^a-zA-Z0-9]/g, "-")}-Pitch-Deck.pptx`;

    // ── Serve pre-generated deck if available ──
    if (job.pitchDeckBase64) {
      const buffer = Buffer.from(job.pitchDeckBase64, "base64");
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // ── Fallback: generate on-demand (template deck only, no code-gen) ──
    const ctx = JSON.parse(job.contextJson);
    const dims = ctx.dimensions as Record<string, Record<string, unknown>>;

    const scores = dims
      ? Object.fromEntries(
          Object.entries(dims).map(([k, v]) => [
            k,
            v.score
              ? {
                  score: (v.score as Record<string, unknown>).score as number,
                  justification: (v.score as Record<string, unknown>)
                    .justification as string,
                  strengths: (v.score as Record<string, unknown>)
                    .strengths as string[],
                  weaknesses: (v.score as Record<string, unknown>)
                    .weaknesses as string[],
                  key_risk: (v.score as Record<string, unknown>)
                    .key_risk as string,
                }
              : null,
          ])
        )
      : null;

    const dimensionFindings = dims
      ? Object.fromEntries(
          Object.entries(dims).map(([k, v]) => [
            k,
            (v.allFindings as string) || "",
          ])
        )
      : null;

    const deckData: PitchDeckData = {
      reportName: job.reportName,
      searchTopic: job.searchTopic,
      intro: ctx.intro || null,
      scores,
      summary: ctx.scoringSummary || null,
      dimensionFindings,
    };

    const buffer = await generatePitchDeck(deckData);

    // Cache for next time (fire-and-forget)
    prisma.report
      .update({
        where: { id: jobId },
        data: { pitchDeckBase64: buffer.toString("base64") },
      })
      .catch(() => {});

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Pitch deck generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate pitch deck" },
      { status: 500 }
    );
  }
}
