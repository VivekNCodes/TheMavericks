import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { MarketplaceStore } from "@/features/marketplace/server/marketplace-store";
import { OrderStatus } from "@/features/marketplace/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      userId,
      newStatus,
      actorRole = "seller",
      note,
    } = body;

    if (!id) {
      return errorResponse("Missing order ID", "BAD_REQUEST", 400);
    }

    if (!userId) {
      return errorResponse("Authentication required: missing userId in order status update", "UNAUTHORIZED", 401);
    }

    if (!newStatus) {
      return errorResponse("Missing newStatus in update payload", "BAD_REQUEST", 400);
    }

    const validStatuses: OrderStatus[] = ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(newStatus as OrderStatus)) {
      return errorResponse(`Invalid status: ${newStatus}`, "BAD_REQUEST", 400);
    }

    const result = await MarketplaceStore.updateOrderStatus({
      orderId: id,
      userId,
      newStatus: newStatus as OrderStatus,
      actorRole: actorRole === "buyer" ? "buyer" : "seller",
      note: note || undefined,
    });

    if (!result.success) {
      return errorResponse(result.error || "Failed to update order status", "BAD_REQUEST", 400);
    }

    return successResponse({
      message: `Order status updated to ${newStatus}`,
      order: result.order,
    });
  } catch (err) {
    console.error("PATCH /api/marketplace/orders/[id] error:", err);
    return errorResponse("Failed to update order", "INTERNAL_ERROR", 500, err);
  }
}
