import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { MarketplaceStore } from "@/features/marketplace/server/marketplace-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = (searchParams.get("role") as "seller" | "buyer") || undefined;
    const listingId = searchParams.get("listingId") || undefined;

    if (!userId) {
      return errorResponse(
        "Authentication required: missing userId to view orders",
        "UNAUTHORIZED",
        401
      );
    }

    const orders = await MarketplaceStore.getOrders({
      userId,
      role,
      listingId,
    });

    return successResponse({
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("GET /api/marketplace/orders error:", err);
    return errorResponse("Failed to fetch orders", "INTERNAL_ERROR", 500, err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      listingId,
      buyerId,
      buyerName,
      buyerPhone,
      buyerWhatsapp,
      buyerEmail,
      buyerAddress,
      quantityRequested,
      deliveryPreference = "Farmgate Pickup",
      notes,
    } = body;

    if (!listingId) {
      return errorResponse("Missing listing ID", "BAD_REQUEST", 400);
    }

    if (!buyerName || typeof buyerName !== "string" || buyerName.trim().length < 2) {
      return errorResponse("Buyer name is required", "BAD_REQUEST", 400);
    }

    if (!buyerWhatsapp || typeof buyerWhatsapp !== "string" || buyerWhatsapp.replace(/\D/g, "").length < 10) {
      return errorResponse("Buyer WhatsApp number is required (min 10 digits) for seller coordination", "BAD_REQUEST", 400);
    }

    const cleanWhatsapp = buyerWhatsapp.replace(/\D/g, "");

    const qty = Number(quantityRequested);
    if (isNaN(qty) || qty <= 0) {
      return errorResponse("Quantity requested must be greater than 0", "BAD_REQUEST", 400);
    }

    const result = await MarketplaceStore.createPurchaseRequest({
      listingId,
      buyerId: buyerId || `buyer-${Date.now()}`,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone?.trim() || cleanWhatsapp,
      buyerWhatsapp: cleanWhatsapp,
      buyerEmail: buyerEmail?.trim() || undefined,
      buyerAddress: buyerAddress?.trim() || undefined,
      quantityRequested: qty,
      deliveryPreference: deliveryPreference.trim(),
      notes: notes?.trim() || undefined,
    });

    if (!result.success) {
      return errorResponse(result.error || "Failed to create purchase request", "BAD_REQUEST", 400);
    }

    return successResponse({
      message: "Purchase request submitted successfully",
      order: result.order,
    }, 201);
  } catch (err) {
    console.error("POST /api/marketplace/orders error:", err);
    return errorResponse("Failed to submit purchase request", "INTERNAL_ERROR", 500, err);
  }
}
