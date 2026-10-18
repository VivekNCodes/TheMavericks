import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getServerFarmerSession } from "@/lib/auth";
import { getUserDiseaseLogs } from "@/lib/user-store";

export async function GET() {
  const sessionUser = await getServerFarmerSession();
  if (!sessionUser || !sessionUser.id) {
    return errorResponse("Authentication required to view disease history", "UNAUTHORIZED", 401);
  }

  const logs = await getUserDiseaseLogs(sessionUser.id);
  return successResponse({
    userId: sessionUser.id,
    logs,
  });
}
