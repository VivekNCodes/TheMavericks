import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchFromDataGovIn } from "@/features/mandi-prices/services/mandi-api";
import { saveMandiRecords, recordSyncLog } from "@/features/mandi-prices/services/mandi-db";
import { getReferenceRecords } from "@/features/mandi-prices/services/reference-records";
import { isDbActive } from "@/lib/db";

export const maxDuration = 60; // Allow 60 seconds on Vercel Pro/Hobby if needed
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleCronJob(request);
}

export async function POST(request: NextRequest) {
  return handleCronJob(request);
}

async function handleCronJob(request: NextRequest) {
  const startedAt = new Date();
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  const cronSecret = process.env.CRON_SECRET;

  // Verify CRON_SECRET if configured, or require valid bearer token
  if (cronSecret && cronSecret.trim() !== "") {
    const bearerExpected = `Bearer ${cronSecret.trim()}`;
    const isAuthorized =
      authHeader === bearerExpected ||
      secretParam === cronSecret.trim() ||
      authHeader === cronSecret.trim();

    if (!isAuthorized) {
      return errorResponse("Unauthorized: Invalid CRON_SECRET", "UNAUTHORIZED", 401);
    }
  } else if (process.env.NODE_ENV === "production") {
    // In production, reject unauthenticated requests if secret is missing
    return errorResponse(
      "CRON_SECRET environment variable is not configured. Please set it in Vercel project settings.",
      "UNAUTHORIZED",
      401
    );
  }

  try {
    let totalFetched = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    const apiKey = process.env.DATA_GOV_IN_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      // Priority states to ingest daily
      const priorityStates = ["Uttar Pradesh", "Rajasthan"];

      for (const state of priorityStates) {
        // Fetch with pagination (e.g. up to 250 records per state)
        const fetchResult = await fetchFromDataGovIn({
          state,
          limit: 250,
          offset: 0,
        });

        if (fetchResult.records.length > 0) {
          totalFetched += fetchResult.records.length;
          const saveResult = await saveMandiRecords(fetchResult.records);
          totalInserted += saveResult.inserted;
          totalUpdated += saveResult.updated;
        }
      }
    } else {
      // In the absence of an API key, seed/sync reference records
      const reference = getReferenceRecords();
      totalFetched = reference.length;
      const saveResult = await saveMandiRecords(reference);
      totalInserted = saveResult.inserted;
      totalUpdated = saveResult.updated;
    }

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    // Log the sync job execution
    await recordSyncLog({
      source: apiKey ? "data.gov.in" : "Reference Baseline",
      status: "SUCCESS",
      recordsFetched: totalFetched,
      recordsInserted: totalInserted,
      recordsUpdated: totalUpdated,
      message: `Completed daily sync in ${durationMs}ms`,
      startedAt,
      completedAt,
    });

    return successResponse({
      job: "mandi-prices-daily-cron",
      status: "SUCCESS",
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs,
      recordsFetched: totalFetched,
      recordsInserted: totalInserted,
      recordsUpdated: totalUpdated,
      databaseActive: isDbActive(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Daily Mandi Cron execution failed:", errorMsg);

    await recordSyncLog({
      source: "data.gov.in",
      status: "FAILED",
      recordsFetched: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      message: "Daily cron run encountered an unhandled exception",
      errorDetails: errorMsg,
      startedAt,
      completedAt: new Date(),
    });

    return errorResponse(`Mandi daily sync job failed: ${errorMsg}`, "CRON_ERROR", 500);
  }
}
