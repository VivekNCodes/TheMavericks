import { NextResponse } from "next/server";
import { isDbActive, prisma } from "@/lib/db";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const dbConfigured = isDbActive();
  let dbStatus: "connected" | "offline_mock" = "offline_mock";

  if (dbConfigured) {
    try {
      // Fast ping to verify connection pooler
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "offline_mock";
    }
  }

  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    platform: "KrishiSetu AI",
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    modules: [
      { id: "crop-disease", status: "operational", owner: "Lead" },
      { id: "mandi-prices", status: "operational", owner: "Member 2" },
      { id: "irrigation", status: "operational", owner: "Member 3" },
      { id: "marketplace", status: "operational", owner: "Member 4" },
    ],
  };

  return successResponse(healthData);
}
