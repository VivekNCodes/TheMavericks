import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getServerFarmerSession } from "@/lib/auth";
import { updateCrop, deleteCrop } from "@/lib/user-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to update crops", "UNAUTHORIZED", 401);
  }

  const cropId = params.id;
  if (!cropId) {
    return errorResponse("Crop ID is required", "BAD_REQUEST", 400);
  }

  try {
    const body = await request.json();
    const updated = await updateCrop(sessionUser.id, cropId, body);

    if (!updated) {
      return errorResponse(
        "Crop not found or you do not have permission to modify this record",
        "NOT_FOUND",
        404
      );
    }

    return successResponse(updated);
  } catch (err) {
    return errorResponse("Failed to update crop", "BAD_REQUEST", 400, err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to delete crops", "UNAUTHORIZED", 401);
  }

  const cropId = params.id;
  if (!cropId) {
    return errorResponse("Crop ID is required", "BAD_REQUEST", 400);
  }

  const deleted = await deleteCrop(sessionUser.id, cropId);
  if (!deleted) {
    return errorResponse(
      "Crop not found or you do not have permission to delete this record",
      "NOT_FOUND",
      404
    );
  }

  return successResponse({ deleted: true, id: cropId });
}
