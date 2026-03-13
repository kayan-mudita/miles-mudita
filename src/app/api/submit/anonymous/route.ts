import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createJob } from "@/lib/pipeline/jobStore";
import { getApiKey } from "@/lib/pipeline/runAgent";
import { checkRateLimit } from "@/lib/rateLimit";
import { pipelineLog } from "@/lib/pipeline/logger";

export const runtime = "nodejs";

const ANON_SUBMIT_LIMIT = 3; // stricter: 3/hour per anonymous user

function generateAnonId(): string {
  // Simple cuid-like ID using timestamp + random
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `anon_${ts}${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchTopic } = body;

    if (!searchTopic || typeof searchTopic !== "string" || searchTopic.trim().length < 10) {
      return NextResponse.json(
        { error: "Please describe your idea in at least a few sentences." },
        { status: 400 }
      );
    }

    // Get or create anonymous user from cookie
    let anonId = req.cookies.get("miles_anon_id")?.value;
    let userId: string;

    if (anonId) {
      // Verify the anonymous user still exists
      const existingUser = await prisma.user.findUnique({ where: { id: anonId } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Cookie references deleted user — create fresh
        anonId = undefined;
        userId = "";
      }
    }

    if (!anonId) {
      const anonEmail = `${generateAnonId()}@anonymous.miles`;
      const newUser = await prisma.user.create({
        data: {
          email: anonEmail,
          isAnonymous: true,
        },
      });
      userId = newUser.id;
      anonId = newUser.id;
    } else {
      userId = userId!;
    }

    // Rate limit: 3/hour for anonymous users
    const { limited } = await checkRateLimit(userId, ANON_SUBMIT_LIMIT);
    if (limited) {
      return NextResponse.json(
        { error: "Too many submissions. Create a free account for more." },
        { status: 429 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Auto-generate report name from idea text
    const reportName = searchTopic.trim().slice(0, 60).replace(/\s+/g, " ");

    pipelineLog.info("Anonymous submit request", {
      data: {
        userId,
        reportName,
        searchTopic: searchTopic.slice(0, 120),
        depth: "QUICK",
      },
    });

    // Force QUICK depth for anonymous submissions
    const report = await createJob(userId, searchTopic.trim(), reportName, "QUICK");

    pipelineLog.info("Anonymous job created", {
      data: { jobId: report.id },
    });

    const maxRounds = 1; // QUICK = 1 round

    // Trigger pipeline (same pattern as authenticated submit)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pipelineSecret = process.env.PIPELINE_SECRET || process.env.AUTH_SECRET;
    if (!pipelineSecret) {
      return NextResponse.json({ error: "Pipeline authentication not configured" }, { status: 500 });
    }

    const isNetlify = !!process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === "production";

    if (isNetlify) {
      const bgUrl = `${appUrl}/.netlify/functions/run-pipeline-background`;
      fetch(bgUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pipeline-secret": pipelineSecret,
        },
        body: JSON.stringify({
          jobId: report.id,
          searchTopic: searchTopic.trim(),
          reportName,
          maxRounds,
        }),
      }).catch(async (err) => {
        pipelineLog.error(`Failed to trigger background function for anon job ${report.id}`, {
          error: (err as Error).message || String(err),
          data: { jobId: report.id },
        });
        await prisma.report.update({
          where: { id: report.id },
          data: { status: "FAILED", error: "Failed to start report pipeline. Please retry." },
        }).catch(() => {});
      });
    } else {
      const { runPipeline } = await import("@/lib/pipeline/orchestrator");
      runPipeline(report.id, searchTopic.trim(), reportName, maxRounds).catch((err) => {
        pipelineLog.error(`Pipeline failed for anon job ${report.id}`, {
          error: (err as Error).message || String(err),
          data: { jobId: report.id },
        });
      });
    }

    // Build response with cookie
    const response = NextResponse.json({ success: true, jobId: report.id });
    response.cookies.set("miles_anon_id", anonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Anonymous submit error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
