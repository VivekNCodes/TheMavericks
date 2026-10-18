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
    const rawBackendUrl = process.env.PLANT_DISEASE_API_URL?.trim();
    const isVercelDeployment = !!(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
    const backendUrl = rawBackendUrl || "http://127.0.0.1:53147";
    const isLocalhostUrl =
      backendUrl.includes("127.0.0.1") ||
      backendUrl.includes("localhost") ||
      backendUrl.includes("0.0.0.0");

    // Guard: Vercel serverless containers cannot connect to developer's localhost
    if (isVercelDeployment && isLocalhostUrl) {
      console.warn(
        `[CropDiseaseAPI] Configuration Error: PLANT_DISEASE_API_URL is configured to local address '${backendUrl}' on Vercel deployment. Serverless functions cannot reach local machine loopback.`
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VERCEL_LOCALHOST_MISCONFIGURATION",
            message:
              "AgroSaathi is deployed on Vercel, but PLANT_DISEASE_API_URL points to a local address (127.0.0.1/localhost). Vercel cloud functions cannot connect to your local computer directly. To connect the trained ResNet50-DCBAM model to Vercel, expose your local service via a secure HTTPS tunnel (e.g., Cloudflare Tunnel) or deploy the Python service, then update PLANT_DISEASE_API_URL in Vercel settings. For local testing, please run AgroSaathi locally at http://localhost:3000.",
            details: {
              configuredUrl: backendUrl,
              environment: "vercel",
            },
          },
        },
        { status: 503 }
      );
    }

    const cleanBaseUrl = backendUrl.replace(/\/+$/, "");
    const predictEndpoint = `${cleanBaseUrl}/predict`;
    const healthEndpoint = `${cleanBaseUrl}/health`;

    // 4. Convert file to Blob Buffer for robust Node.js HTTP forwarding
    const fileBytes = await file.arrayBuffer();
    const fileBlob = new Blob([fileBytes], { type: file.type || "image/jpeg" });
    const outgoingFormData = new FormData();
    outgoingFormData.append("file", fileBlob, file.name);

    const requestHeaders: Record<string, string> = {};
    if (process.env.PLANT_DISEASE_API_KEY) {
      requestHeaders["X-Api-Key"] = process.env.PLANT_DISEASE_API_KEY.trim();
    }

    console.log(
      `[CropDiseaseAPI] Forwarding inference request to: ${predictEndpoint} (file: ${file.name}, size: ${file.size} bytes)`
    );

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(predictEndpoint, {
        method: "POST https://ivory-mug-truck-telecom.trycloudflare.com/predict",
        headers: requestHeaders,
        body: outgoingFormData,
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchErr: unknown) {
      const isTimeout =
        fetchErr instanceof Error &&
        (fetchErr.name === "TimeoutError" || fetchErr.name === "AbortError");

      const errMessage = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);

      console.error(`[CropDiseaseAPI] Upstream fetch failure for ${predictEndpoint}:`, {
        error: errMessage,
        isTimeout,
      });

      if (isTimeout) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INFERENCE_TIMEOUT",
              message:
                "The inference request timed out after 15 seconds. The Python model server at PLANT_DISEASE_API_URL took too long to respond.",
              details: { endpoint: predictEndpoint },
            },
          },
          { status: 504 }
        );
      }

      // Probing health check to distinguish between completely offline service vs. /predict failure
      let isHealthOnline = false;
      try {
        const probeRes = await fetch(healthEndpoint, {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        if (probeRes.ok) {
          isHealthOnline = true;
        }
      } catch {
        // Health probe also failed; backend is confirmed offline
      }

      if (isHealthOnline) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INFERENCE_PREDICT_FAILED",
              message: `The plant disease service at ${cleanBaseUrl} is online, but the /predict endpoint failed to accept the request (${errMessage}).`,
              details: { endpoint: predictEndpoint },
            },
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INFERENCE_SERVICE_UNAVAILABLE",
            message: `The plant disease inference backend is currently offline or unreachable at ${cleanBaseUrl}. Please ensure the model service (server.py) is running on port 53147.`,
            details: {
              endpoint: predictEndpoint,
              error: process.env.NODE_ENV === "development" ? errMessage : undefined,
            },
          },
        },
        { status: 503 }
      );
    }

    console.log(
      `[CropDiseaseAPI] Upstream response: HTTP ${upstreamRes.status} ${upstreamRes.statusText}`
    );

    if (!upstreamRes.ok) {
      let upstreamDetail = "";
      try {
        const errorJson = await upstreamRes.json();
        if (errorJson?.detail) {
          upstreamDetail =
            typeof errorJson.detail === "string"
              ? errorJson.detail
              : JSON.stringify(errorJson.detail);
        }
      } catch {
        // fallback to status text
      }

      if (upstreamRes.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INFERENCE_ENDPOINT_NOT_FOUND",
              message: `Inference endpoint was not found at ${predictEndpoint} (HTTP 404). Verify that server.py defines the /predict route.`,
            },
          },
          { status: 502 }
        );
      }

      if (upstreamRes.status === 413) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FILE_TOO_LARGE",
              message:
                upstreamDetail ||
                "Uploaded leaf image exceeds the maximum 5 MB limit supported by the model.",
            },
          },
          { status: 413 }
        );
      }

      if (upstreamRes.status === 400) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_IMAGE_DATA",
              message:
                upstreamDetail ||
                "The uploaded image could not be decoded. Please upload a valid JPEG, PNG, or WEBP leaf image.",
            },
          },
          { status: 400 }
        );
      }

      if (upstreamRes.status === 401 || upstreamRes.status === 403) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INFERENCE_UNAUTHORIZED",
              message:
                "Authentication failed with the inference server. Check your PLANT_DISEASE_API_KEY configuration.",
            },
          },
          { status: 502 }
        );
      }

      if (upstreamRes.status === 503) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MODEL_NOT_INITIALIZED",
              message:
                upstreamDetail ||
                "Plant disease inference model is currently not loaded or initialized on the server.",
            },
          },
          { status: 503 }
        );
      }

      if (upstreamRes.status >= 500) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UPSTREAM_MODEL_ERROR",
              message:
                "The Python inference server encountered an internal error during ResNet50-DCBAM model processing.",
              details: process.env.NODE_ENV === "development" ? upstreamDetail : undefined,
            },
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: `UPSTREAM_${upstreamRes.status}`,
            message: upstreamDetail || `Upstream inference service returned HTTP ${upstreamRes.status}.`,
          },
        },
        { status: upstreamRes.status }
      );
    }

    let pyData: PythonPredictionResponse;
    try {
      pyData = await upstreamRes.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_RESPONSE_SCHEMA",
            message: "Failed to parse JSON response from the plant disease inference service.",
          },
        },
        { status: 502 }
      );
    }

    if (!pyData || typeof pyData.predicted_class_label !== "string" || typeof pyData.confidence !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNEXPECTED_RESPONSE_SCHEMA",
            message: "The model inference response is missing required classification fields.",
            details: process.env.NODE_ENV === "development" ? pyData : undefined,
          },
        },
        { status: 502 }
      );
    }

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
    console.error("[CropDiseaseAPI] Uncaught handler error:", errorMsg);
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
