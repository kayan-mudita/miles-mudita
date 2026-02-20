import { prisma } from "@/lib/db";

/**
 * Database-backed rate limiting for report submissions.
 * Counts reports created by a user in the last hour.
 * Works correctly in serverless environments (no in-memory state).
 */
export async function checkRateLimit(
  userId: string,
  limit: number
): Promise<{ limited: boolean; remaining: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const count = await prisma.report.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (count >= limit) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: limit - count };
}

/**
 * Database-backed rate limiting for signup.
 * Counts recently created accounts to limit abuse.
 * In serverless, IP-based in-memory limits don't persist, so we
 * count total signups in the time window instead.
 */
export async function checkSignupRateLimit(
  limit: number,
  windowMs: number
): Promise<{ limited: boolean; remaining: number }> {
  const since = new Date(Date.now() - windowMs);

  const count = await prisma.user.count({
    where: {
      createdAt: { gte: since },
    },
  });

  if (count >= limit) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: limit - count };
}
