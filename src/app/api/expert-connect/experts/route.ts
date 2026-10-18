import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ExpertService } from "@/features/expert-connect/services/expert-service";
import { KISAN_CALL_CENTRE } from "@/features/expert-connect/data/demonstration-experts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get("specialization") || undefined;
    const language = searchParams.get("language") || undefined;
    const query = searchParams.get("query") || undefined;

    const experts = ExpertService.getExperts({ specialization, language, query });

    return successResponse({
      experts,
      total: experts.length,
      kisanCallCentre: KISAN_CALL_CENTRE,
      isDemonstrationEnvironment: true,
      serviceModel: "100% Free Agricultural Consultation for Indian Farmers",
    });
  } catch (err) {
    return errorResponse("Failed to fetch expert directory", "INTERNAL_ERROR", 500, err);
  }
}
