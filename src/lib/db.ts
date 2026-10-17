import { PrismaClient } from "@prisma/client";

// Declare global Prisma instance to prevent multiple client instances during hot reloading in Next.js
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("ep-sample-pool") &&
    !process.env.DATABASE_URL.includes("username:password")
);

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export function isDbActive(): boolean {
  return isDatabaseConfigured;
}

export default prisma;
