import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getServerFarmerSession } from "@/lib/auth";
import { getUserCrops, createCrop } from "@/lib/user-store";

export async function GET() {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to view your crops", "UNAUTHORIZED", 401);
  }

  const crops = await getUserCrops(sessionUser.id);
  return successResponse({
    userId: sessionUser.id,
    crops,
    count: crops.length,
  });
}

export async function POST(request: NextRequest) {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to add crops", "UNAUTHORIZED", 401);
  }

  try {
    const body = await request.json();
    const {
      cropName,
      variety,
      acreage,
      growthStage,
      sowingDate,
      expectedHarvestDate,
      fieldLocation,
      soilType,
      irrigationType,
      fertilizerNotes,
      notes,
      imageUrl,
    } = body;

    if (!cropName || typeof cropName !== "string" || cropName.trim().length === 0) {
      return errorResponse("Crop name is required", "BAD_REQUEST", 400);
    }

    const parsedAcreage = parseFloat(acreage);
    if (isNaN(parsedAcreage) || parsedAcreage <= 0) {
      return errorResponse("Acreage must be a positive number", "BAD_REQUEST", 400);
    }

    const created = await createCrop(sessionUser.id, {
      cropName: cropName.trim(),
      variety: variety?.trim() || undefined,
      acreage: parsedAcreage,
      growthStage: growthStage || "VEGETATIVE",
      sowingDate: sowingDate || undefined,
      expectedHarvestDate: expectedHarvestDate || undefined,
      fieldLocation: fieldLocation?.trim() || undefined,
      soilType: soilType?.trim() || undefined,
      irrigationType: irrigationType?.trim() || undefined,
      fertilizerNotes: fertilizerNotes?.trim() || undefined,
      notes: notes?.trim() || undefined,
      imageUrl: imageUrl || undefined,
    });

    return successResponse(created);
  } catch (err) {
    return errorResponse("Failed to create crop record", "BAD_REQUEST", 400, err);
  }
}
