import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { successResponse, errorResponse } from "@/lib/api-response";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "marketplace");
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided in form data", "BAD_REQUEST", 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return errorResponse(
        `Unsupported file type '${file.type}'. Allowed formats: JPG, PNG, WEBP.`,
        "BAD_REQUEST",
        400
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse(
        `File size ${(file.size / (1024 * 1024)).toFixed(2)} MB exceeds maximum limit of 5 MB`,
        "BAD_REQUEST",
        400
      );
    }

    // Ensure uploads folder exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const filename = `produce-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
    const destinationPath = path.join(UPLOAD_DIR, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(destinationPath, buffer);

    const publicUrl = `/uploads/marketplace/${filename}`;

    return successResponse({
      message: "Image uploaded successfully",
      url: publicUrl,
      filename,
      sizeBytes: file.size,
    }, 201);
  } catch (err) {
    console.error("POST /api/marketplace/upload error:", err);
    return errorResponse("Failed to upload image", "INTERNAL_ERROR", 500, err);
  }
}
