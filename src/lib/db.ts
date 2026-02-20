import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { _prisma?: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "";

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment variables."
    );
  }

  // Prisma Accelerate / local dev proxy URL
  if (url.startsWith("prisma+postgres://") || url.startsWith("prisma://")) {
    return new PrismaClient({ accelerateUrl: url });
  }

  // Direct Postgres URL — use PrismaPg adapter with PoolConfig
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

/** Lazy singleton — only connects when first accessed at request time. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!globalForPrisma._prisma) {
      globalForPrisma._prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma._prisma, prop);
  },
});
