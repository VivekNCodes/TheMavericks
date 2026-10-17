import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { CropPlanInput } from "@/features/crop-planner/types";
import { fetchWeatherOutlook } from "@/features/crop-planner/services/weather-service";
import { generateCropGrowingPlan } from "@/features/crop-planner/engine/knowledge-engine";
import { getPlanAiExplanation } from "@/features/crop-planner/engine/ai-explainer";
import { SupportedLanguage } from "@/i18n/translations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: CropPlanInput = body.input;
    const lang: SupportedLanguage = body.lang || "en";

    if (!input) {
      return errorResponse("Missing input payload", "BAD_REQUEST", 400);
    }

    if (!input.cropId || !input.sowingDate || !input.soilType || !input.landArea || !input.location) {
      return errorResponse("Incomplete crop plan configuration", "BAD_REQUEST", 400);
    }

    // Resolve weather for farmer location
    const weatherOutlook = await fetchWeatherOutlook(
      input.location.latitude,
      input.location.longitude,
      input.location.name
    );

    // Generate deterministic agronomic plan
    const plan = generateCropGrowingPlan(input, weatherOutlook);

    // Add farmer-friendly advisory
    plan.aiExplanation = await getPlanAiExplanation(plan, lang);

    return successResponse(plan);
  } catch (err) {
    console.error("Plan generation API error:", err);
    return errorResponse("Failed to generate growing plan", "INTERNAL_ERROR", 500, err);
  }
}
