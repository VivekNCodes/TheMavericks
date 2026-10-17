import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma, isDbActive } from "@/lib/db";
import { GrowingPlan } from "@/features/crop-planner/types";

// In-memory mock store for local development when Neon database URL is unconfigured
const memorySavedPlans: Array<{
  id: string;
  userId?: string;
  farmerName: string;
  cropName: string;
  cropId: string;
  locationName: string;
  sowingDate: string;
  landArea: number;
  areaUnit: string;
  soilType: string;
  irrigationMethod: string;
  createdAt: string;
  plan: GrowingPlan;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plan: GrowingPlan = body.plan;
    const userId: string | undefined = body.userId;
    const farmerName: string = body.farmerName || "Guest Farmer";

    if (!plan || !plan.id) {
      return errorResponse("Missing plan payload", "BAD_REQUEST", 400);
    }

    if (isDbActive()) {
      try {
        const saved = await prisma.cropPlan.create({
          data: {
            id: plan.id,
            userId: userId && !userId.startsWith("google-") ? userId : null,
            farmerName,
            cropName: plan.crop.name,
            cropId: plan.crop.id,
            locationName: plan.weatherOutlook.resolvedLocation,
            sowingDate: new Date(plan.input.sowingDate),
            landArea: plan.input.landArea,
            areaUnit: plan.input.areaUnit,
            soilType: plan.input.soilType,
            irrigationMethod: plan.input.irrigationMethod,
            planData: plan as any,
          },
        });

        return successResponse({
          source: "neon-postgres",
          id: saved.id,
          savedAt: saved.createdAt,
        });
      } catch (dbErr) {
        console.warn("Neon database save encountered an error, falling back to local memory store:", dbErr);
      }
    }

    // Offline / Mock fallback store
    const localRecord = {
      id: plan.id,
      userId,
      farmerName,
      cropName: plan.crop.name,
      cropId: plan.crop.id,
      locationName: plan.weatherOutlook.resolvedLocation,
      sowingDate: plan.input.sowingDate,
      landArea: plan.input.landArea,
      areaUnit: plan.input.areaUnit,
      soilType: plan.input.soilType,
      irrigationMethod: plan.input.irrigationMethod,
      createdAt: new Date().toISOString(),
      plan,
    };

    const existingIndex = memorySavedPlans.findIndex((p) => p.id === plan.id);
    if (existingIndex >= 0) {
      memorySavedPlans[existingIndex] = localRecord;
    } else {
      memorySavedPlans.unshift(localRecord);
    }

    return successResponse({
      source: "local-storage-fallback",
      id: localRecord.id,
      savedAt: localRecord.createdAt,
      message: "Plan saved to local store (database offline)",
    });
  } catch (err) {
    return errorResponse("Failed to save plan", "INTERNAL_ERROR", 500, err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (isDbActive()) {
    try {
      const records = await prisma.cropPlan.findMany({
        where: userId && !userId.startsWith("google-") ? { userId } : {},
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return successResponse({
        source: "neon-postgres",
        plans: records.map((r) => ({
          id: r.id,
          userId: r.userId,
          farmerName: r.farmerName,
          cropName: r.cropName,
          cropId: r.cropId,
          locationName: r.locationName,
          sowingDate: r.sowingDate.toISOString().split("T")[0],
          landArea: r.landArea,
          areaUnit: r.areaUnit,
          soilType: r.soilType,
          irrigationMethod: r.irrigationMethod,
          createdAt: r.createdAt.toISOString(),
          plan: r.planData as unknown as GrowingPlan,
        })),
      });
    } catch (dbErr) {
      console.warn("Neon database fetch failed, reading from fallback store:", dbErr);
    }
  }

  // Fallback
  return successResponse({
    source: "local-storage-fallback",
    plans: memorySavedPlans,
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("id");

  if (!planId) {
    return errorResponse("Missing plan id", "BAD_REQUEST", 400);
  }

  if (isDbActive()) {
    try {
      await prisma.cropPlan.delete({ where: { id: planId } });
      return successResponse({ id: planId, deleted: true });
    } catch (e) {
      console.warn("DB delete failed:", e);
    }
  }

  const idx = memorySavedPlans.findIndex((p) => p.id === planId);
  if (idx >= 0) memorySavedPlans.splice(idx, 1);

  return successResponse({ id: planId, deleted: true });
}
