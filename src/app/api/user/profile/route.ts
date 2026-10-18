import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getServerFarmerSession } from "@/lib/auth";
import { getUserById, updateUserProfile, deleteUserAccount } from "@/lib/user-store";

export async function GET() {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to access profile", "UNAUTHORIZED", 401);
  }

  const profile = await getUserById(sessionUser.id);
  if (!profile) {
    return errorResponse("User profile not found", "NOT_FOUND", 404);
  }

  return successResponse(profile);
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to update profile", "UNAUTHORIZED", 401);
  }

  try {
    const body = await request.json();
    const allowedFields = [
      "name",
      "preferredName",
      "preferredLanguage",
      "state",
      "district",
      "village",
      "farmSize",
      "farmSizeUnit",
      "soilType",
      "irrigationMethod",
      "farmingExperience",
      "avatarUrl",
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (body.acres !== undefined && body.farmSize === undefined) {
      updates.farmSize = parseFloat(body.acres);
    }

    const updated = await updateUserProfile(sessionUser.id, updates);
    if (!updated) {
      return errorResponse("Failed to update profile", "INTERNAL_ERROR", 500);
    }

    return successResponse(updated);
  } catch (err) {
    return errorResponse("Invalid profile update request", "BAD_REQUEST", 400, err);
  }
}

export async function DELETE(request: NextRequest) {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to delete account", "UNAUTHORIZED", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!body.confirmDelete) {
      return errorResponse(
        "Account deletion requires explicit confirmation: confirmDelete: true",
        "BAD_REQUEST",
        400
      );
    }

    const deleted = await deleteUserAccount(sessionUser.id);
    if (!deleted) {
      return errorResponse("Failed to delete account", "INTERNAL_ERROR", 500);
    }

    return successResponse({
      deleted: true,
      message: "Account and associated agricultural records have been permanently deleted.",
    });
  } catch (err) {
    return errorResponse("Account deletion failed", "INTERNAL_ERROR", 500, err);
  }
}
