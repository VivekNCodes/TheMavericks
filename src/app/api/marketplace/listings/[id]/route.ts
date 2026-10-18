import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { MarketplaceStore } from "@/features/marketplace/server/marketplace-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const listing = await MarketplaceStore.getListingById(id);

    if (!listing) {
      return errorResponse("Listing not found", "NOT_FOUND", 404);
    }

    return successResponse({ listing });
  } catch (err) {
    return errorResponse("Failed to fetch listing", "INTERNAL_ERROR", 500, err);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return errorResponse("Authentication required: missing userId", "UNAUTHORIZED", 401);
    }

    const result = await MarketplaceStore.updateListing(id, userId, body);

    if (!result.success) {
      return errorResponse(result.error || "Update failed", "BAD_REQUEST", 400);
    }

    return successResponse({
      message: "Listing updated successfully",
      listing: result.listing,
    });
  } catch (err) {
    return errorResponse("Failed to update listing", "INTERNAL_ERROR", 500, err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return errorResponse("Authentication required: missing userId parameter", "UNAUTHORIZED", 401);
    }

    const result = await MarketplaceStore.deleteListing(id, userId);

    if (!result.success) {
      return errorResponse(result.error || "Delete failed", "BAD_REQUEST", 400);
    }

    return successResponse({
      message: "Listing deleted successfully",
      id,
    });
  } catch (err) {
    return errorResponse("Failed to delete listing", "INTERNAL_ERROR", 500, err);
  }
}
