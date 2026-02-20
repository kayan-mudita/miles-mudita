import { prisma } from "@/lib/db";
import { pipelineLog } from "./logger";

export async function createJob(
  userId: string,
  searchTopic: string,
  reportName: string,
  depth: "QUICK" | "STANDARD" | "DEEP" = "STANDARD",
  teamId?: string
) {
  const estimatedMinutes = depth === "QUICK" ? 5 : depth === "STANDARD" ? 25 : 45;

  const report = await prisma.report.create({
    data: {
      userId,
      teamId: teamId || null,
      reportName,
      searchTopic,
      status: "RUNNING",
      stage: "queued",
      progress: 0,
      detail: "Job created",
      depth,
      estimatedMinutes,
    },
  });

  pipelineLog.info("Job created", {
    data: { jobId: report.id, userId, depth, searchTopic: searchTopic.slice(0, 120) },
  });

  return report;
}

export async function getJob(id: string) {
  return await prisma.report.findUnique({ where: { id } });
}

export async function updateJob(
  id: string,
  update: {
    status?: "RUNNING" | "COMPLETED" | "FAILED";
    stage?: string;
    progress?: number;
    detail?: string;
    reportHtml?: string;
    contextJson?: string;
    error?: string;
    overallScore?: number;
    recommendation?: string;
    marketScore?: number;
    competitionScore?: number;
    costScore?: number;
    productScore?: number;
    financialScore?: number;
    completedAt?: Date;
  }
) {
  if (update.stage || update.status) {
    pipelineLog.debug("Job update", {
      data: {
        jobId: id,
        ...(update.stage ? { stage: update.stage } : {}),
        ...(update.status ? { status: update.status } : {}),
        ...(update.progress !== undefined ? { progress: update.progress } : {}),
        ...(update.detail ? { detail: update.detail } : {}),
      },
    });
  }

  const report = await prisma.report.update({
    where: { id },
    data: update,
  });

  return report;
}
