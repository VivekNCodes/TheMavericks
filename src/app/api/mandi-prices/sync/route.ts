import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchFromDataGovIn } from "@/features/mandi-prices/services/mandi-api";
import { saveMandiRecords, recordSyncLog } from "@/features/mandi-prices/services/mandi-db";
import { getReferenceRecords } from "@/features/mandi-prices/services/reference-records";
import { isDbActive } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startedAt = new Date();
  try {
    const body = await request.json().catch(() => ({}));
    const state = body.state || "Uttar Pradesh";
    const crop = body.crop || undefined;

    let recordsFetched = 0;
    let recordsInserted = 0;
    let recordsUpdated = 0;
    let sourceUsed = "Reference Data";

    const apiKey = process.env.DATA_GOV_IN_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      sourceUsed = "data.gov.in Live API";
      const live = await fetchFromDataGovIn({
        state,
        crop,
        limit: 100,
      });

      if (live.records.length > 0) {
        recordsFetched = live.records.length;
        const saveRes = await saveMandiRecords(live.records);
        recordsInserted = saveRes.inserted;
        recordsUpdated = saveRes.updated;
      }
    } else {
      const reference = getReferenceRecords();
      recordsFetched = reference.length;
      const saveRes = await saveMandiRecords(reference);
      recordsInserted = saveRes.inserted;
      recordsUpdated = saveRes.updated;
    }

    const completedAt = new Date();
    await recordSyncLog({
      source: sourceUsed,
      status: "SUCCESS",
      recordsFetched,
      recordsInserted,
      recordsUpdated,
      message: `Manual sync completed successfully for ${state}`,
      startedAt,
      completedAt,
    });

    return successResponse({
      message: `Manual sync completed successfully`,
      source: sourceUsed,
      recordsFetched,
      recordsInserted,
      recordsUpdated,
      databaseActive: isDbActive(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Manual sync failed:", errorMsg);
    return errorResponse(`Manual sync failed: ${errorMsg}`, "SYNC_ERROR", 500);
  }
}
