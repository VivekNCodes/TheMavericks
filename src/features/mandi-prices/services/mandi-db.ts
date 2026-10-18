import { prisma, isDbActive } from "@/lib/db";
import { NormalizedMandiRecord, MandiFilterParams } from "../types";
import { getReferenceRecords } from "./reference-records";

/**
 * Idempotently save or update normalized mandi records in PostgreSQL via Prisma.
 * Uses `recordHash` to avoid duplicates on reruns.
 */
export async function saveMandiRecords(records: NormalizedMandiRecord[]): Promise<{
  inserted: number;
  updated: number;
  errors: number;
}> {
  if (!isDbActive()) {
    return { inserted: 0, updated: 0, errors: 0 };
  }

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const rec of records) {
    try {
      const recordDate = new Date(rec.recordDate);

      // Perform safe upsert keyed on deterministic recordHash
      const existing = await prisma.mandiPrice.findUnique({
        where: { recordHash: rec.recordHash },
      });

      if (existing) {
        // Update price fields if source revised them, preserving original arrival recordDate
        await prisma.mandiPrice.update({
          where: { recordHash: rec.recordHash },
          data: {
            minPrice: rec.minPrice,
            modalPrice: rec.modalPrice,
            maxPrice: rec.maxPrice,
            priceUnit: rec.priceUnit,
            source: rec.source,
            fetchedAt: new Date(rec.fetchedAt),
            arrivalsTonnes: rec.arrivalsTonnes ?? existing.arrivalsTonnes,
            trendPercent: rec.trendPercent ?? existing.trendPercent,
          },
        });
        updated++;
      } else {
        await prisma.mandiPrice.create({
          data: {
            state: rec.state,
            district: rec.district,
            mandiName: rec.mandiName,
            cropName: rec.cropName,
            variety: rec.variety,
            grade: rec.grade,
            minPrice: rec.minPrice,
            modalPrice: rec.modalPrice,
            maxPrice: rec.maxPrice,
            priceUnit: rec.priceUnit,
            arrivalsTonnes: rec.arrivalsTonnes,
            trendPercent: rec.trendPercent,
            source: rec.source,
            recordDate,
            recordHash: rec.recordHash,
            fetchedAt: new Date(rec.fetchedAt),
          },
        });
        inserted++;
      }
    } catch (err) {
      console.error(`Failed to upsert mandi record ${rec.recordHash}:`, err);
      errors++;
    }
  }

  return { inserted, updated, errors };
}

/**
 * Query stored Mandi prices from PostgreSQL with filtering, pagination, and sorting
 */
export async function queryStoredMandiPrices(params: MandiFilterParams = {}): Promise<{
  records: NormalizedMandiRecord[];
  total: number;
}> {
  if (!isDbActive()) {
    return { records: [], total: 0 };
  }

  const whereClause: Record<string, unknown> = {};

  if (params.state) {
    whereClause.state = { equals: params.state, mode: "insensitive" };
  }
  if (params.district) {
    whereClause.district = { equals: params.district, mode: "insensitive" };
  }
  if (params.crop) {
    whereClause.cropName = { equals: params.crop, mode: "insensitive" };
  }
  if (params.market) {
    whereClause.mandiName = { equals: params.market, mode: "insensitive" };
  }
  if (params.search) {
    const s = params.search.trim();
    whereClause.OR = [
      { mandiName: { contains: s, mode: "insensitive" } },
      { cropName: { contains: s, mode: "insensitive" } },
      { district: { contains: s, mode: "insensitive" } },
      { variety: { contains: s, mode: "insensitive" } },
    ];
  }

  try {
    const [total, dbRecords] = await Promise.all([
      prisma.mandiPrice.count({ where: whereClause }),
      prisma.mandiPrice.findMany({
        where: whereClause,
        orderBy: [{ recordDate: "desc" }, { modalPrice: "desc" }],
        take: params.limit || 50,
        skip: params.offset || 0,
      }),
    ]);

    const now = new Date();
    const records: NormalizedMandiRecord[] = dbRecords.map((r) => {
      const arrival = new Date(r.recordDate);
      const diffTime = Math.abs(now.getTime() - arrival.getTime());
      const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: r.id,
        state: r.state,
        district: r.district,
        mandiName: r.mandiName,
        cropName: r.cropName,
        variety: r.variety || "Common",
        grade: r.grade || "FAQ",
        minPrice: r.minPrice,
        modalPrice: r.modalPrice,
        maxPrice: r.maxPrice,
        priceUnit: r.priceUnit,
        arrivalsTonnes: r.arrivalsTonnes,
        trendPercent: r.trendPercent,
        source: r.source,
        recordDate: r.recordDate.toISOString(),
        fetchedAt: r.fetchedAt.toISOString(),
        recordHash: r.recordHash || r.id,
        isStale: daysAgo > 2,
        daysAgo,
      };
    });

    return { records, total };
  } catch (err) {
    console.error("Database queryStoredMandiPrices error:", err);
    return { records: [], total: 0 };
  }
}

/**
 * Log sync/cron results in mandi_sync_logs table
 */
export async function recordSyncLog(log: {
  source?: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  message?: string;
  errorDetails?: string;
  startedAt: Date;
  completedAt: Date;
}) {
  if (!isDbActive()) return;

  try {
    await prisma.mandiSyncLog.create({
      data: {
        source: log.source || "data.gov.in",
        status: log.status,
        recordsFetched: log.recordsFetched,
        recordsInserted: log.recordsInserted,
        recordsUpdated: log.recordsUpdated,
        message: log.message,
        errorDetails: log.errorDetails,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
      },
    });
  } catch (err) {
    console.error("Failed to write to mandi_sync_logs:", err);
  }
}

/**
 * Seed database with reference records if database is empty
 */
export async function seedIfEmpty(): Promise<boolean> {
  if (!isDbActive()) return false;

  try {
    const count = await prisma.mandiPrice.count();
    if (count === 0) {
      const reference = getReferenceRecords();
      await saveMandiRecords(reference);
      return true;
    }
  } catch (err) {
    console.warn("Could not check/seed mandi records:", err);
  }
  return false;
}
