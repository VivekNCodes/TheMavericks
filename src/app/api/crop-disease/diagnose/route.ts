import { NextRequest, NextResponse } from "next/server";
import { getAgronomicGuidance } from "@/features/crop-disease/data/treatment-guidance";
import type { ModelDiagnosisResult, PredictionCandidate } from "@/features/crop-disease/types";
import { getServerFarmerSession } from "@/lib/auth";
import { recordUserDiseaseLog } from "@/lib/user-store";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

interface PythonPredictionItem {
  rank: number;
  class_index: number;
  class_label: string;
  crop: string;
  condition: string;
  is_healthy: boolean;
  confidence: number;
}

interface PythonPredictionResponse {
  success: boolean;
  predicted_class_index: number;
  predicted_class_label: string;
  crop: string;
  condition: string;
  is_healthy: boolean;
  confidence: number;
  top_predictions: PythonPredictionItem[];
  device: string;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CONTENT_TYPE",
            message: "Request must be multipart/form-data with a 'file' field.",
          },
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FILE",
            message: "No image file provided in the request.",
          },
        },
        { status: 400 }
      );
    }

    // 1. File size validation
    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_FILE",
            message: "The uploaded file is empty.",
          },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: `Uploaded file exceeds the maximum limit of 5 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
          },
        },
        { status: 413 }
      );
    }

    // 2. MIME type & file extension validation
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const mime = (file.type || "").toLowerCase();

    const isExtensionValid = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeValid = !mime || ALLOWED_MIME_TYPES.includes(mime);

    if (!isExtensionValid || !isMimeValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FORMAT",
            message: `Unsupported file format. Please upload a JPEG, PNG, or WEBP leaf image.`,
          },
        },
        { status: 400 }
      );
    }

    // 3. Resolve backend URL (server-only environment variable)
    const backendUrl = process.env.PLANT_DISEASE_API_URL || "http://127.0.0.1:53147";
    const predictEndpoint = `${backendUrl.replace(/\/+$/, "")}/predict`;

    // 4. Forward to FastAPI backend (with optional auth header for HTTPS tunnel)
    const outgoingFormData = new FormData();
    outgoingFormData.append("file", file, file.name);

    const requestHeaders: Record<string, string> = {};
    if (process.env.PLANT_DISEASE_API_KEY) {
      requestHeaders["X-Api-Key"] = process.env.PLANT_DISEASE_API_KEY;
    }

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(predictEndpoint, {
        method: "POST",
        headers: requestHeaders,
        body: outgoingFormData,
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchErr: unknown) {
      const isTimeout =
        fetchErr instanceof Error && fetchErr.name === "TimeoutError";

      return NextResponse.json(
        {
          success: false,
          error: {
            code: isTimeout ? "GATEWAY_TIMEOUT" : "INFERENCE_SERVICE_UNAVAILABLE",
            message: isTimeout
              ? "The inference service timed out while analyzing the image."
              : "The plant disease inference backend is currently offline. Please ensure the model service is running at PLANT_DISEASE_API_URL.",
          },
        },
        { status: 503 }
      );
    }

    if (!upstreamRes.ok) {
      let errorDetail = "Upstream model inference failed.";
      try {
        const errorJson = await upstreamRes.json();
        if (errorJson?.detail) {
          errorDetail =
            typeof errorJson.detail === "string"
              ? errorJson.detail
              : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use default message
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: `UPSTREAM_${upstreamRes.status}`,
            message: errorDetail,
          },
        },
        { status: upstreamRes.status }
      );
    }

    const pyData: PythonPredictionResponse = await upstreamRes.json();

    // 5. Augment prediction with ICAR agronomic guidance
    const guidance = getAgronomicGuidance(pyData.predicted_class_label);

    const topCandidates: PredictionCandidate[] = (pyData.top_predictions || []).map(
      (item) => ({
        rank: item.rank,
        classIndex: item.class_index,
        classLabel: item.class_label,
        crop: item.crop,
        condition: item.condition,
        isHealthy: item.is_healthy,
        confidence: item.confidence,
      })
    );

    const diagnosisResult: ModelDiagnosisResult = {
      id: `diag-${Date.now()}`,
      source: "model",
      crop: pyData.crop,
      condition: pyData.condition,
      classLabel: pyData.predicted_class_label,
      scientificName: guidance.scientificName,
      isHealthy: pyData.is_healthy,
      confidence: pyData.confidence,
      severity: guidance.severity,
      summary: guidance.summary,
      recommendedActions: guidance.actions,
      topPredictions: topCandidates,
      device: pyData.device,
      timestamp: new Date().toISOString(),
      disclaimer:
        "Disclaimer: This is an AI-assisted prediction from the trained ResNet50-DCBAM model. For critical crop management decisions, consult a local agricultural extension officer or your nearest Krishi Vigyan Kendra (KVK).",
    };

    // If user is authenticated, persist diagnosis to their persistent history
    try {
      const sessionUser = await getServerFarmerSession();
      if (sessionUser?.id) {
        await recordUserDiseaseLog(sessionUser.id, {
          detectedDisease: `${pyData.crop} - ${pyData.condition}`,
          scientificName: guidance.scientificName,
          confidence: pyData.confidence,
          severity: guidance.severity,
          symptoms: guidance.summary,
          treatmentSummary: guidance.actions.join("; "),
          imageUrl: "/images/crop-tomato.webp",
        });
      }
    } catch (saveErr) {
      console.warn("Could not save diagnosis to user profile history:", saveErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: diagnosisResult,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while processing the leaf diagnosis request.",
          details: process.env.NODE_ENV === "development" ? errorMsg : undefined,
        },
      },
      { status: 500 }
    );
  }
}
