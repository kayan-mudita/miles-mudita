import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { createJob } from "@/lib/pipeline/jobStore";
import { getApiKey } from "@/lib/pipeline/runAgent";
import { checkRateLimit } from "@/lib/rateLimit";
import { pipelineLog } from "@/lib/pipeline/logger";

export const runtime = "nodejs";

const SUBMIT_LIMIT = 10;

const DEPTH_ROUNDS: Record<string, number> = {
  QUICK: 1,
  STANDARD: 3,
  DEEP: 5,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { limited } = await checkRateLimit(session.user.id, SUBMIT_LIMIT);
    if (limited) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { reportName, searchTopic, depth = "STANDARD", teamId } = body;

    if (!reportName || !searchTopic) {
      return NextResponse.json(
        { error: "Report name and search topic are required" },
        { status: 400 }
      );
    }

    const validDepths = ["QUICK", "STANDARD", "DEEP"];
    if (!validDepths.includes(depth)) {
      return NextResponse.json(
        { error: "Invalid depth. Must be QUICK, STANDARD, or DEEP" },
        { status: 400 }
      );
    }

    pipelineLog.info("Submit request received", {
      data: {
        userEmail: session.user.email ?? "unknown",
        reportName,
        searchTopic: searchTopic.slice(0, 120),
        depth,
      },
    });

    // If teamId is provided, verify the user is a member of that team
    if (teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: session.user.id } },
      });
      if (!membership) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const report = await createJob(
      session.user.id,
      searchTopic,
      reportName,
      depth as "QUICK" | "STANDARD" | "DEEP",
      teamId
    );

    pipelineLog.info("Job created", {
      data: { jobId: report.id },
    });

    const maxRounds = DEPTH_ROUNDS[depth] ?? 3;

    // Trigger the pipeline via Netlify Background Function (returns 202 immediately)
    // Falls back to direct execution in development
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pipelineSecret =
      process.env.PIPELINE_SECRET || process.env.AUTH_SECRET || "";

    const isNetlify = !!process.env.NETLIFY;

    if (isNetlify) {
      // In production on Netlify: call the background function
      const bgUrl = `${appUrl}/.netlify/functions/run-pipeline-background`;
      pipelineLog.info("Triggering Netlify background function", {
        data: { jobId: report.id, maxRounds, bgUrl },
      });

      fetch(bgUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pipeline-secret": pipelineSecret,
        },
        body: JSON.stringify({
          jobId: report.id,
          searchTopic,
          reportName,
          maxRounds,
        }),
      }).catch((err) => {
        pipelineLog.error(
          `Failed to trigger background function for job ${report.id}`,
          {
            error: (err as Error).message || String(err),
            data: { jobId: report.id },
          }
        );
      });
    } else {
      // In local development: fire-and-forget in the same process
      pipelineLog.info("Launching pipeline (fire-and-forget, local dev)", {
        data: { jobId: report.id, maxRounds },
      });
      const { runPipeline } = await import("@/lib/pipeline/orchestrator");
      runPipeline(report.id, searchTopic, reportName, maxRounds).catch(
        (err) => {
          pipelineLog.error(`Pipeline failed for job ${report.id}`, {
            error: (err as Error).message || String(err),
            data: { jobId: report.id },
          });
        }
      );
    }

    return NextResponse.json({ success: true, jobId: report.id });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
